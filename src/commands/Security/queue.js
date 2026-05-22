import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show current queue (Basic)'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const key = `${guildId}-${userId}`;
        if (!whitelistDB.has(key) && userId !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only whitelisted members can use this!", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("🎵 Music Queue")
            .setDescription("• No songs in queue (Basic mode active)\n\n*Full music system coming soon with proper queue support.*")
            .setColor(0x00FF00);

        await interaction.reply({ embeds: [embed] });
    }
};
