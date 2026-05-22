import { SlashCommandBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';
import { joinVoiceChannel } from '@discordjs/voice';

export default {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join your voice channel (Whitelisted only)'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const key = `${guildId}-${userId}`;
        if (!whitelistDB.has(key) && userId !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only whitelisted members can use music commands!", ephemeral: true });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: "❌ You must be in a voice channel first!", ephemeral: true });
        }

        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: true
        });

        await interaction.reply(`✅ **Joined** ${voiceChannel.name}`);
    }
};
