import { SlashCommandBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and leave voice channel (Basic)'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const key = `${guildId}-${userId}`;
        if (!whitelistDB.has(key) && userId !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only whitelisted members can use this!", ephemeral: true });
        }

        await interaction.reply("⏹️ Stopped music and left the voice channel! *(Basic mode)*");
    }
};
