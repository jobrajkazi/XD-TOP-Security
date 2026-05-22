import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song (Basic)')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name or YouTube link')
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

        const embed = new EmbedBuilder()
            .setTitle("🎵 Music Command")
            .setDescription(`**Searching for:** ${query}\n\n*Basic music system is limited.*\nUse full music system later for better experience.`)
            .setColor(0x00FF00);

        await interaction.reply({ embeds: [embed] });
    }
};
