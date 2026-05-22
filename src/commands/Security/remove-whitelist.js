import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { whitelistDB } from './whitelist.js';
import fs from 'fs';
import path from 'path';

const whitelistFile = path.join(process.cwd(), 'whitelist.json');

function saveWhitelist() {
    try {
        const data = Object.fromEntries(whitelistDB);
        fs.writeFileSync(whitelistFile, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Failed to save whitelist:", err);
    }
}

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
        // Only Server Owner can use this
        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: "❌ Only the **Server Owner** can remove users from whitelist!",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('user');
        const guildId = interaction.guild.id;
        const key = `${guildId}-${target.id}`;

        if (!whitelistDB.has(key)) {
            return interaction.reply({
                content: `❌ **${target.tag}** is not whitelisted.`,
                ephemeral: true
            });
        }

        // Remove from whitelist
        whitelistDB.delete(key);
        saveWhitelist(); // Save permanently

        const embed = new EmbedBuilder()
            .setTitle("✅ User Removed from Whitelist")
            .setColor("Red")
            .setDescription(`**${target.tag}** (${target.id}) has been removed from the whitelist.\n\n✅ Changes saved permanently.`);

        await interaction.reply({ embeds: [embed] });
    }
};
