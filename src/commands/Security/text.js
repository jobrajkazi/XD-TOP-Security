import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('text')
        .setDescription('Send compact professional message')
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
                .setDescription('Message content')
                .setRequired(true)
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

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setDescription(text);

        if (title && title.trim() !== '') {
            embed.setTitle(title);
        }

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: `✅ Sent in ${channel}`, ephemeral: true });
    }
};
