import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { getFromDb, setInDb } from "../../utils/database.js";
import { logger } from "../../utils/logger.js";
import { createEmbed } from "../../utils/embeds.js";
import crypto from "crypto";

export default {
    data: new SlashCommandBuilder()
        .setName("save")
        .setDescription("Owner only: Save full server backup")
        .addSubcommand(sub =>
            sub.setName("server").setDescription("Create a full server backup")
        ),

    async execute(interaction) {
        const ownerIds = process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',').map(id => id.trim()) : [];
        if (!ownerIds.includes(interaction.user.id)) {
            return interaction.reply({ content: "❌ Owner only command.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;

            // Collect backup data
            const backup = {
                guildId: guild.id,
                guildName: guild.name,
                createdAt: Date.now(),
                channels: [],
                roles: [],
                categories: []
            };

            // Save Roles
            backup.roles = guild.roles.cache
                .filter(r => !r.managed)
                .map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    position: role.position,
                    permissions: role.permissions.bitfield.toString()
                }));

            // Save Channels & Categories
            const channels = Array.from(guild.channels.cache.values()).sort((a, b) => a.position - b.position);
            
            for (const channel of channels) {
                if (channel.type === 4) { // Category
                    backup.categories.push({
                        id: channel.id,
                        name: channel.name,
                        position: channel.position
                    });
                } else {
                    backup.channels.push({
                        id: channel.id,
                        name: channel.name,
                        type: channel.type,
                        parentId: channel.parentId,
                        position: channel.position,
                        topic: channel.topic || null,
                        nsfw: channel.nsfw || false
                    });
                }
            }

            // Generate unique backup code
            const backupCode = "SV-" + crypto.randomBytes(6).toString('hex').toUpperCase();

            // Save to database
            await setInDb(`server_backup:${backupCode}`, backup, 60 * 60 * 24 * 7); // 7 days expiry

            const embed = createEmbed({
                title: "✅ Server Backup Created",
                description: `Backup Code: \`${backupCode}\`\n\nKeep this code safe!`,
                color: "success"
            });

            embed.addFields(
                { name: "📊 Saved", value: `${backup.roles.length} Roles\n${backup.channels.length} Channels\n${backup.categories.length} Categories`, inline: false }
            );

            await interaction.editReply({ embeds: [embed] });

            logger.info(`Server backup created by owner: ${backupCode}`);

        } catch (error) {
            logger.error("Save server error:", error);
            await interaction.editReply({ content: "❌ Failed to create backup." });
        }
    }
};
