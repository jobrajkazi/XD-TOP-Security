const { Events, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        // Check Whitelist
        const whitelistLevel = await db.get(`whitelist.${guildId}.${userId}`);
        if (whitelistLevel) return; // Whitelisted users are free

        // Get bad words
        const badwords = await db.get(`badwords.${guildId}`) || [];

        const content = message.content.toLowerCase();

        // === Swear Detection ===
        if (badwords.some(word => content.includes(word))) {
            await punishUser(message, "Toxic / Offensive Language", "Medium");
            return;
        }

        // === Spam Detection (Simple) ===
        if (message.channel.messages.cache.filter(m => m.author.id === userId).size > 5) {
            await punishUser(message, "Spam Messages", "High");
            return;
        }

        // You can add more detections here (links, images, etc.)
    }
};

async function punishUser(message, reason, level) {
    const member = message.member;
    const guild = message.guild;

    let action = "Warning";

    if (level === "High") {
        action = "Timeout";
        await member.timeout(10 * 60 * 1000, reason).catch(() => {}); // 10 minutes
    } else if (level === "Critical") {
        action = "Kick";
        await member.kick(reason).catch(() => {});
    }

    // Delete the bad message
    message.delete().catch(() => {});

    // === DM to User ===
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ ERROR EXE OFFICIAL — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "📌 DETECTED ACTIVITY:", value: `• ${reason}` },
            { name: "━━━━━━━━━━━━━━", value: "Our system continuously monitors server activity..." }
        )
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // === Alert to Bot Owner ===
    const owner = await guild.client.users.fetch(guild.ownerId).catch(() => null);
    if (owner) {
        const alertEmbed = new EmbedBuilder()
            .setTitle("🚨 ERROR EXE OFFICIAL — SECURITY ALERT")
            .setColor("DarkRed")
            .addFields(
                { name: "👤 User", value: `${message.author.tag} (${message.author.id})` },
                { name: "🆔 User ID", value: message.author.id },
                { name: "📍 Channel", value: `<#${message.channel.id}>` },
                { name: "🕒 Time", value: `<t:${Math.floor(Date.now()/1000)}>` },
                { name: "📌 DETECTED REASON", value: reason },
                { name: "📊 Threat Level", value: level },
                { name: "🤖 System Action Taken", value: action }
            );

        owner.send({ embeds: [alertEmbed] }).catch(() => {});
    }
}
