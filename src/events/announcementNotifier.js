import { Events, EmbedBuilder } from 'discord.js';

const ANNOUNCEMENT_CHANNELS = [
    '1503431066004750404',   // New Announcement Channel 1
    '1503698449525379224',   // New Announcement Channel 2
    '1503431065652690949'    // New Announcement Channel 3
];

const STAFF_ROLE_IDS = [
    '1503431065157632116',
    '1503431065157632118',
    '1503431065165889617',
    '1503431065157632119'
];

const SPECIAL_CHANNEL = '1503431065652690949'; // Channel where if anything posted → DM Everyone

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        // === ANNOUNCEMENT ALERTS ===
        if (ANNOUNCEMENT_CHANNELS.includes(message.channel.id)) {
            
            const embed = new EmbedBuilder()
                .setTitle("🚨 NEW ANNOUNCEMENT ALERT")
                .setColor("#FF0000")
                .setDescription("**There is a new announcement posted!**")
                .addFields(
                    { name: "📢 Channel", value: `<#${message.channel.id}>` },
                    { name: "👤 Posted By", value: `${message.author.tag}` },
                    { name: "🕒 Time", value: `<t:${Math.floor(Date.now() / 1000)}>` }
                )
                .setFooter({ text: "⚠️ Please check it as soon as possible" })
                .setTimestamp();

            // Send to users who have any of the staff roles
            const members = await message.guild.members.fetch();
            const staffMembers = members.filter(member => 
                member.roles.cache.some(role => STAFF_ROLE_IDS.includes(role.id))
            );

            for (const member of staffMembers.values()) {
                try {
                    await member.send({
                        content: "🚨 **IMPORTANT ANNOUNCEMENT** 🚨",
                        embeds: [embed]
                    });
                } catch (err) {
                    // Ignore if DM failed
                }
            }
        }

        // === SPECIAL CHANNEL: Send to EVERYONE in Server ===
        if (message.channel.id === SPECIAL_CHANNEL) {
            const embed = new EmbedBuilder()
                .setTitle("📢 SERVER-WIDE NOTIFICATION")
                .setColor("#00FF00")
                .setDescription("**A new message has been posted in an important channel.**")
                .addFields(
                    { name: "📍 Channel", value: `<#${message.channel.id}>` },
                    { name: "👤 Posted By", value: `${message.author.tag}` },
                    { name: "🕒 Time", value: `<t:${Math.floor(Date.now() / 1000)}>` }
                )
                .setTimestamp();

            const members = await message.guild.members.fetch();

            for (const member of members.values()) {
                if (member.user.bot) continue;
                try {
                    await member.send({
                        content: "📢 **Server Notification** 📢",
                        embeds: [embed]
                    });
                } catch (err) {
                    // Ignore users who have DMs closed
                }
            }
        }
    }
};
