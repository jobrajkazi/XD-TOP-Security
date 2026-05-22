import { SlashCommandBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join your voice channel (Basic)'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const key = `${guildId}-${userId}`;
        if (!whitelistDB.has(key) && userId !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only whitelisted members can use this!", ephemeral: true });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: "❌ You must be in a voice channel first!", ephemeral: true });
        }

        await interaction.reply(`✅ Bot joined **${voiceChannel.name}**\n\n*Note: Basic music system is active.*`);
    }
};
