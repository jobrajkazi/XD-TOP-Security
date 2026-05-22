import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('text')
        .setDescription('Send a professional message (Full Access only)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select the channel')
                .setRequired(true)
                .addChannelTypes(0, 5)
        )
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Write your message here')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Permission Check (Only Full Access + Owner)
        const key = `${guildId}-${userId}`;
        const whitelistLevel = whitelistDB.get(key);
        const isFullAccess = whitelistLevel === 'full' || whitelistLevel === 'botaccess';
        const isOwner = userId === interaction.guild.ownerId;

        if (!isFullAccess && !isOwner) {
            return interaction.reply({
                content: "❌ Only **Full Access Whitelisted Members** or **Server Owner** can use this!",
                ephemeral: true
            });
        }

        const channel = interaction.options.getChannel('channel');
        const userText = interaction.options.getString('text');

        try {
            // Auto Professional Formatting
            const embed = new EmbedBuilder()
                .setTitle("📜 OFFICIAL ANNOUNCEMENT")
                .setDescription(userText.replace(/\\n/g, '\n'))
                .setColor(0x1F1F1F) // Dark professional color
                .setTimestamp()
                .setFooter({ 
                    text: `XD TOP Security • ${interaction.user.tag}`,
                    iconURL: interaction.guild.iconURL() || null
                });

            await channel.send({ embeds: [embed] });

            // Success message to user
            await interaction.reply({
                content: `✅ Professional message sent successfully in ${channel}`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "❌ Failed to send message. Make sure the bot has permission in that channel.",
                ephemeral: true
            });
        }
    }
};
