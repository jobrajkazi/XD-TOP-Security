import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';
import { badwordsDB } from '../commands/Security/sr.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const key = `${guildId}-${userId}`;

        // Skip whitelisted users
        if (whitelistDB.has(key)) return;

        const content = message.content.toLowerCase().trim();
        const badwords = badwordsDB.get(guildId) || [];

        let reason = null;
        let threat = "High"; // Default high for zero tolerance

        // Strong Swear Detection
        if (badwords.some(word => content.includes(word))) {
            reason = "Toxic / Offensive Language";
        } 
        // Strong Spam Detection
        else if (message.channel.messages.cache.filter(m => m.author.id === userId).size >= 5) {
            reason = "Spam Messages";
        }

        if (reason) {
            await punishUser(message, reason, threat);
        }
    }
};

async function punishUser(message, reason, threat) {
    const member = message.member;
    if (!member) return;

    // Delete Message
    message.delete().catch(() => {});

    // Hard Punishment - 0 Mercy
    try {
        await member.timeout(30 * 60 * 1000, `Zero Tolerance: ${reason}`); // 30 minutes timeout
    } catch (e) {
        try {
            await member.kick(`Zero Tolerance: ${reason}`);
        } catch {}
    }

    // === LONG DM TO USER (Merciless) ===
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ ERROR EXE OFFICIAL — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "━━━━━━━━━━━━━━", value: "📌 DETECTED ACTIVITY:" },
            { name: "• Toxic / Offensive Language", value: reason.includes("Toxic") ? "✅ Detected" : "❌", inline: true },
            { name: "• Spam Messages", value: reason.includes("Spam") ? "✅ Detected" : "❌", inline: true }
        )
        .addFields({
            name: "━━━━━━━━━━━━━━",
            value: "**You have been automatically punished for violating server security rules.**\n\nOur system has **ZERO TOLERANCE** for toxic behavior and spam."
        })
        .addFields({
            name: "Action Taken:",
            value: "• Message Deleted\n• Timeout (30 Minutes)\n• Warning Recorded"
        })
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM • NO MERCY MODE ENABLED 🛡️" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // Alert to Owner
    const owner = await message.client.users.fetch(message.guild.ownerId).catch(() => null);
    if (owner) {
        const alert = new EmbedBuilder()
            .setTitle("🚨 ERROR EXE OFFICIAL — SECURITY ALERT")
            .setColor("DarkRed")
            .addFields(
                { name: "👤 User", value: `${message.author.tag}` },
                { name: "🆔 User ID", value: message.author.id },
                { name: "📍 Channel", value: `<#${message.channel.id}>` },
                { name: "📌 Reason", value: reason },
                { name: "Action Taken", value: "Timeout (30m) + DM Sent" }
            );

        owner.send({ embeds: [alert] }).catch(() => {});
    }
};
