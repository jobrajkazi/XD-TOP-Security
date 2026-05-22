import { Events, EmbedBuilder } from 'discord.js';

const ANNOUNCEMENT_CHANNELS = [
    '1503477652076494882',
    '1503477652076494883'
];

const STAFF_IDS = [
    '1503477651417858214',
    '1503477651497549984',
    '1503810475161288836',
    '1503477651518656528'
];

export default {
    name: Events.MessageCreate,
    async execute(message) {
        // Only trigger for the two announcement channels
        if (!ANNOUNCEMENT_CHANNELS.includes(message.channel.id)) return;
        if (message.author.bot) return;

        // Create important looking DM notification
        const embed = new EmbedBuilder()
            .setTitle("🚨 NEW ANNOUNCEMENT ALERT")
            .setColor("#FF0000") // Bright Red
            .setDescription(`**There is a new announcement posted!**`)
            .addFields(
                { 
                    name: "📢 Channel", 
                    value: `<#${message.channel.id}>` 
                },
                { 
                    name: "👤 Posted By", 
                    value: `${message.author.tag}` 
                },
                { 
                    name: "🕒 Time", 
                    value: `<t:${Math.floor(Date.now() / 1000)}>` 
                }
            )
            .setFooter({ text: "⚠️ Please check it as soon as possible" })
            .setTimestamp();

        // Send DM to all staff members
        for (const userId of STAFF_IDS) {
            try {
                const user = await message.client.users.fetch(userId);
                await user.send({ 
                    content: "🚨 **IMPORTANT ANNOUNCEMENT** 🚨", 
                    embeds: [embed] 
                });
            } catch (err) {
                console.log(`Could not DM user ${userId}`);
            }
        }
    }
};
