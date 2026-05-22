import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { whitelistDB } from './whitelist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('whitelist-check')
        .setDescription('Check all whitelisted members and their levels')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // Check if user is Server Owner OR Whitelisted
        const isWhitelisted = whitelistDB.has(`${guildId}-${userId}`);
        const isOwner = interaction.user.id === interaction.guild.ownerId;

        if (!isOwner && !isWhitelisted) {
            return interaction.reply({ 
                content: "❌ Only **Server Owner** or **Whitelisted Members** can use this command!", 
                ephemeral: true 
            });
        }

        let description = "";
        let count = 0;

        for (const [key, level] of whitelistDB.entries()) {
            if (key.startsWith(guildId + "-")) {
                const memberId = key.split("-")[1];
                try {
                    const user = await interaction.client.users.fetch(memberId);
                    description += `**${user.tag}** (${user.id})\n`;
                    description += `➜ Level: **${level}**\n\n`;
                    count++;
                } catch {
                    description += `**Unknown User** (${memberId})\n➜ Level: **${level}**\n\n`;
                    count++;
                }
            }
        }

        if (count === 0) {
            description = "No whitelisted members found in this server.";
        }

        const embed = new EmbedBuilder()
            .setTitle("📋 XD TOP — WHITELIST CHECK")
            .setColor("Gold")
            .setDescription(description)
            .setFooter({ text: `Total Whitelisted: ${count} members | Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
