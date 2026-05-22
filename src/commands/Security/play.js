import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('Song name or link')
                .setRequired(true)
        ),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const key = `${guildId}-${userId}`;
        if (!whitelistDB.has(key) && userId !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only whitelisted members!", ephemeral: true });
        }

        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: "❌ Join a voice channel first!", ephemeral: true });
        }

        await interaction.deferReply();

        try {
            const player = useMainPlayer();
            const { track } = await player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: interaction.channel,
                    volume: 80,
                    leaveOnEmpty: true,
                    leaveOnStop: true,
                }
            });

            await interaction.editReply(`🎵 **Playing:** ${track.title}`);
        } catch (e) {
            await interaction.editReply("❌ Could not play this song.");
        }
    }
};
