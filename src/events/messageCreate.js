import { Events, EmbedBuilder } from 'discord.js';

const whitelistDB = new Map();
const badwordsDB = new Map();

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        const key = `${guildId}-${userId}`;
        if (whitelistDB.has(key)) return;

        const content = message.content.toLowerCase().trim();
        const badwords = badwordsDB.get(guildId) || [];

        let reason = null;
        let threat = "Medium";

        if (badwords.some(word => content.includes(word))) {
            reason = "Toxic / Offensive Language";
        } else if (message.channel.messages.cache.filter(m => m.author.id === userId).size >= 6) {
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

    await message.delete().catch(() => {});

    try {
        await member.timeout(30 * 60 * 1000, `Zero Tolerance: ${reason}`);
    } catch (e) {
        try {
            await member.kick(`Zero Tolerance: ${reason}`);
        } catch {}
    }

    // === DM to Punished User ===
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ XD TOP — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "━━━━━━━━━━━━━━", value: "📌 DETECTED ACTIVITY:" },
            { name: "• Toxic / Offensive Language", value: reason.includes("Toxic") ? "✅ Detected" : "❌", inline: true },
            { name: "• Spam Messages", value: reason.includes("Spam") ? "✅ Detected" : "❌", inline: true }
        )
        .addFields({
            name: "━━━━━━━━━━━━━━",
            value: "**You have been punished for violating server rules.**\nOur system has **ZERO TOLERANCE**."
        })
        .setFooter({ text: "— XD TOP SECURITY SYSTEM" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // === NOTIFICATION TO ALL WHITELISTED USERS (Staff) ===
    const guildId = message.guild.id;
    for (const [mapKey, level] of whitelistDB.entries()) {
        if (mapKey.startsWith(guildId + "-")) {
            const staffId = mapKey.split("-")[1];
            const staffUser = await message.client.users.fetch(staffId).catch(() => null);
            
            if (staffUser) {
                const staffEmbed = new EmbedBuilder()
                    .setTitle("🚨 XD TOP — STAFF ALERT")
                    .setColor("Orange")
                    .addFields(
                        { name: "👤 Punished User", value: `${message.author.tag} (${message.author.id})` },
                        { name: "📍 Channel", value: `<#${message.channel.id}>` },
                        { name: "📌 Reason", value: reason },
                        { name: "🤖 Action Taken", value: "Timeout (30 Minutes)" },
                        { name: "🕒 Time", value: `<t:${Math.floor(Date.now()/1000)}>` }
                    )
                    .setFooter({ text: "Zero Tolerance Mode • XD TOP" });

                staffUser.send({ embeds: [staffEmbed] }).catch(() => {});
            }
        }
    }

    // Also send to Server Owner
    const owner = await message.client.users.fetch(message.guild.ownerId).catch(() => null);
    if (owner) {
        owner.send({ embeds: [ /* same staffEmbed as above */ ] }).catch(() => {});
    }
}
