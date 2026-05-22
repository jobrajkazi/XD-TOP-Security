import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('text')
        .setDescription('Send clean professional message with left line')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select the channel')
                .setRequired(true)
                .addChannelTypes(0, 5)
        )
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title (Optional - Leave empty for no title)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Main message content (use \\n for new lines)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Permission Check
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
        const title = interaction.options.getString('title');
        const userText = interaction.options.getString('text').replace(/\\n/g, '\n');

        try {
            const embed = new EmbedBuilder()
                .setColor(0x00FF00) // Bright green left line
                .setDescription(userText);

            // Add title only if provided
            if (title && title.trim() !== '') {
                embed.setTitle(title);
            }

            await channel.send({ embeds: [embed] });

            await interaction.reply({
                content: `✅ Message sent successfully in ${channel}`,
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "❌ Failed to send message. Check bot permissions.",
                ephemeral: true
            });
        }
    }
};
