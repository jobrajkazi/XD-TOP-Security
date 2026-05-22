import { SlashCommandBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip current song (Basic)'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const key = `${guildId}-${userId}`;
        if (!whitelistDB.has(key) && userId !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only whitelisted members can use this!", ephemeral: true });
        }

        await interaction.reply("⏭️ Skipped current song! *(Basic mode - limited functionality)*");
    }
};
