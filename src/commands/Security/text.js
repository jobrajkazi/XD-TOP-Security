import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('text')
        .setDescription('Send a message in any channel (Full Access Whitelisted only)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select the channel to send message')
                .setRequired(true)
                .addChannelTypes(0, 5) // Text & Announcement channels
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message you want to send')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Check if user is Full Access Whitelisted or Server Owner
        const key = `${guildId}-${userId}`;
        const whitelistLevel = whitelistDB.get(key);

        const isFullAccess = whitelistLevel === 'full';
        const isOwner = userId === interaction.guild.ownerId;

        if (!isFullAccess && !isOwner) {
            return interaction.reply({
                content: "❌ Only **Full Access Whitelisted Members** or **Server Owner** can use this command!",
                ephemeral: true
            });
        }

        const channel = interaction.options.getChannel('channel');
        const messageText = interaction.options.getString('message');

        if (!channel) {
            return interaction.reply({ content: "❌ Invalid channel!", ephemeral: true });
        }

        try {
            await channel.send(messageText);

            const successEmbed = new EmbedBuilder()
                .setTitle("✅ Message Sent Successfully")
                .setColor("Green")
                .setDescription(`**Message sent in ${channel}**`)
                .addFields(
                    { name: "📍 Channel", value: `${channel}`, inline: true },
                    { name: "👤 Sent By", value: `${interaction.user.tag}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });

        } catch (error) {
            await interaction.reply({
                content: `❌ Failed to send message. Make sure I have permission in ${channel}.`,
                ephemeral: true
            });
        }
    }
};
