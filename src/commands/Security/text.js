import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('text')
        .setDescription('Send clean Discord-like message with optional attachment')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Select the channel')
                .setRequired(true)
                .addChannelTypes(0, 5)
        )
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title (Optional)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Main message content (supports \\n for new lines)')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName('item')
                .setDescription('Image or file to attach (any size)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const key = `${guildId}-${userId}`;
        const whitelistLevel = whitelistDB.get(key);
        const isFullAccess = whitelistLevel === 'full' || whitelistLevel === 'botaccess';
        const isOwner = userId === interaction.guild.ownerId;

        if (!isFullAccess && !isOwner) {
            return interaction.reply({ content: "❌ Only Full Access or Owner!", ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        let text = interaction.options.getString('text').replace(/\\n/g, '\n');
        const attachment = interaction.options.getAttachment('item');

        // Prepare files if any
        const files = attachment ? [new AttachmentBuilder(attachment.url, { name: attachment.name })] : [];

        let messageOptions = {};

        if (title || text.length > 2000) {
            // Use embed for long messages or when title exists
            const embed = new EmbedBuilder()
                .setColor(0x2b2d31) // Discord dark theme color
                .setDescription(text);

            if (title && title.trim() !== '') {
                embed.setTitle(title);
            }

            messageOptions = { embeds: [embed], files };
        } else {
            // Plain message for short texts (looks more natural)
            messageOptions = { content: text, files };
        }

        try {
            await channel.send(messageOptions);
            await interaction.reply({ 
                content: `✅ Message sent successfully in ${channel}`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: "❌ Failed to send message. Check permissions.", 
                ephemeral: true 
            });
        }
    }
};
