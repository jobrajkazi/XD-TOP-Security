const { Events, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        // Skip whitelisted users
        const whitelist = await db.get(`whitelist.${guildId}.${userId}`);
        if (whitelist) return;

        const content = message.content.toLowerCase().trim();
        const badwords = await db.get(`badwords.${guildId}`) || [];

        let reason = null;
        let threat = "Medium";

        // Swear Detection
        if (badwords.some(word => content.includes(word))) {
            reason = "Toxic / Offensive Language";
        }
        // Basic Spam Detection
        else if (message.channel.messages.cache.filter(m => m.author.id === userId).size >= 6) {
            reason = "Spam Messages";
            threat = "High";
        }

        if (reason) {
            await punishUser(message, reason, threat);
        }
    }
};

async function punishUser(message, reason, threat) {
    const member = message.member;
    if (!member) return;

    // Delete message
    message.delete().catch(() => {});

    let action = "Warning";

    if (threat === "High") {
        action = "Timeout (10m)";
        await member.timeout(10 * 60 * 1000, reason).catch(() => {});
    }

    // DM to User
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ ERROR EXE OFFICIAL — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "📌 DETECTED ACTIVITY:", value: `• ${reason}` },
            { name: "━━━━━━━━━━━━━━", value: "Our system continuously monitors server activity to maintain a safe environment." }
        )
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM 🛡️" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // Alert to Server Owner
    const owner = await message.client.users.fetch(message.guild.ownerId).catch(() => null);
    if (owner) {
        const alert = new EmbedBuilder()
            .setTitle("🚨 ERROR EXE OFFICIAL — SECURITY ALERT")
            .setColor("DarkRed")
            .addFields(
                { name: "👤 User", value: `${message.author.tag}` },
                { name: "🆔 User ID", value: message.author.id },
                { name: "📍 Channel", value: `<#${message.channel.id}>` },
                { name: "🕒 Time", value: `<t:${Math.floor(Date.now()/1000)}>` },
                { name: "📌 DETECTED REASON", value: reason },
                { name: "📊 Threat Level", value: threat },
                { name: "🤖 System Action Taken", value: action }
            );

        owner.send({ embeds: [alert] }).catch(() => {});
    }
}
