import { SlashCommandBuilder } from 'discord.js';
import { useMainPlayer } from 'discord-player';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop music and leave voice'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const key = `${guildId}-${userId}`;
        if (!whitelistDB.has(key) && userId !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Whitelisted only!", ephemeral: true });
        }

        const player = useMainPlayer();
        const queue = player.nodes.get(guildId);

        if (queue) {
            queue.delete();
            await interaction.reply("⏹️ Stopped music and left the channel.");
        } else {
            await interaction.reply("❌ Not playing anything.");
        }
    }
};
