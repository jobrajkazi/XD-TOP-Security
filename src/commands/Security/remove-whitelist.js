import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('remove-whitelist')
        .setDescription('Remove a user from whitelist (Owner Only)')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User to remove from whitelist')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Only Server Owner can use this command
        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: "❌ Only the **Server Owner** can remove users from whitelist!",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('user');
        const guildId = interaction.guild.id;
        const key = `${guildId}-${target.id}`;

        // Check if user is actually whitelisted
        if (!whitelistDB.has(key)) {
            return interaction.reply({
                content: `❌ **${target.tag}** is not whitelisted.`,
                ephemeral: true
            });
        }

        // Remove from whitelist
        whitelistDB.delete(key);

        const embed = new EmbedBuilder()
            .setTitle("✅ User Removed from Whitelist")
            .setColor("Red")
            .setDescription(`**${target.tag}** (${target.id}) has been successfully removed from the whitelist.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
