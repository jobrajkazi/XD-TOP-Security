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

    message.delete().catch(() => {});

    let action = "Warning";
    if (threat === "High") {
        action = "Timeout (10 Minutes)";
        await member.timeout(10 * 60 * 1000, reason).catch(() => {});
    }

    // Long DM to User
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ ERROR EXE OFFICIAL — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "━━━━━━━━━━━━━━", value: "📌 DETECTED ACTIVITY:" },
            { name: "• Toxic / Offensive Language", value: reason.includes("Toxic") ? "✅ Detected" : "❌ Not Detected", inline: true },
            { name: "• Spam Messages", value: reason.includes("Spam") ? "✅ Detected" : "❌ Not Detected", inline: true }
        )
        .addFields({
            name: "━━━━━━━━━━━━━━",
            value: "Our system continuously monitors server activity to maintain a safe, clean, and friendly environment for every member inside the community.\n\nBecause of your recent activity, your account has been automatically flagged by the protection system.\n\n⚠️ This warning is officially recorded inside the moderation logs."
        })
        .addFields({
            name: "Please understand:",
            value: "Repeated violations may result in the following actions without additional warning:\n• Temporary Timeout\n• Permanent Mute\n• Kick From Server\n• Permanent Ban\n• Blacklist From Future Access"
        })
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM 🛡️ Automated Moderation & Protection" });

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
                { name: "🕒 Time", value: `<t:${Math.floor(Date.now()/1000)}>` },
                { name: "📌 DETECTED REASON", value: reason },
                { name: "📊 Threat Level", value: threat },
                { name: "🤖 System Action Taken", value: action }
            );
        owner.send({ embeds: [alert] }).catch(() => {});
    }
};

export { whitelistDB, badwordsDB };
