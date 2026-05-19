import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';
import { badwordsDB } from '../commands/Security/sr.js';

const BOT_OWNERS = ["858482656252657674", "1409273535238508585", "1503475813767577721"];

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        // Skip whitelisted users
        const key = `${guildId}-${userId}`;
        if (whitelistDB.has(key)) return;

        const content = message.content.toLowerCase().trim();
        const badwords = badwordsDB.get(guildId) || [];

        let reason = null;
        let threat = "Medium";

        // Swear Detection
        if (badwords.some(word => content.includes(word))) {
            reason = "Toxic / Offensive Language";
            threat = "High";                    // ← Changed to High
        }
        // Spam Detection
        else if (message.channel.messages.cache.filter(m => m.author.id === userId).size >= 5) {
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
    try {
        await message.delete();
    } catch (e) {}

    let action = "Warning";

    if (threat === "High") {
        action = "Kick";
        try {
            await member.kick(`Auto Moderation: ${reason}`);
            console.log(`✅ Kicked ${message.author.tag} for ${reason}`);
        } catch (err) {
            console.error("Kick failed:", err.message);
            // Fallback to timeout if kick fails
            try {
                await member.timeout(30 * 60 * 1000, reason);
                action = "Timeout (30m)";
            } catch {}
        }
    }

    // DM to User
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ ERROR EXE OFFICIAL — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "━━━━━━━━━━━━━━", value: `**📌 DETECTED ACTIVITY:**\n• ${reason}` },
            { 
                name: "━━━━━━━━━━━━━━", 
                value: "Our advanced moderation system has detected activity from your account that violates the official community guidelines...\n\n⚠️ This warning is officially recorded." 
            },
            { 
                name: "Please understand:", 
                value: "Repeated violations may result in:\n• Kick\n• Permanent Ban" 
            }
        )
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM 🛡️" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // DM to Bot Owners
    for (const ownerId of BOT_OWNERS) {
        try {
            const owner = await message.client.users.fetch(ownerId);
            const alertEmbed = new EmbedBuilder()
                .setTitle("🚨 ERROR EXE OFFICIAL — SECURITY ALERT")
                .setColor("DarkRed")
                .addFields(
                    { name: "👤 User", value: `${message.author.tag} (${message.author.id})` },
                    { name: "📍 Channel", value: `<#${message.channel.id}>` },
                    { name: "🕒 Time", value: `<t:${Math.floor(Date.now()/1000)}>` },
                    { name: "📌 DETECTED REASON", value: reason },
                    { name: "📊 Threat Level", value: threat },
                    { name: "🤖 Action Taken", value: action }
                );

            await owner.send({ embeds: [alertEmbed] });
        } catch (e) {}
    }
}
