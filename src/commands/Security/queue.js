import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show current queue'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const key = `${guildId}-${userId}`;
        if (!whitelistDB.has(key) && userId !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Whitelisted only!", ephemeral: true });
        }

        const player = useMainPlayer();
        const queue = player.nodes.get(guildId);

        if (!queue || queue.tracks.size === 0) {
            return interaction.reply("❌ Queue is empty!");
        }

        const embed = new EmbedBuilder()
            .setTitle("🎵 Music Queue")
            .setDescription(queue.tracks.map((track, i) => 
                `${i+1}. **${track.title}**`
            ).join('\n').slice(0, 4000))
            .setColor(0x00FF00);

        await interaction.reply({ embeds: [embed] });
    }
};
