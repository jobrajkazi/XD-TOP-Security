import { SlashCommandBuilder } from "discord.js";
import { getFromDb } from "../../utils/database.js";
import { logger } from "../../utils/logger.js";
import { createEmbed } from "../../utils/embeds.js";

export default {
    data: new SlashCommandBuilder()
        .setName("load")
        .setDescription("Owner only: Restore server from backup")
        .addSubcommand(sub =>
            sub.setName("server")
                .setDescription("Restore server using backup code")
                .addStringOption(option =>
                    option.setName("code")
                        .setDescription("Backup Code (SV-XXXXXXXX)")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const ownerIds = process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',').map(id => id.trim()) : [];
        if (!ownerIds.includes(interaction.user.id)) {
            return interaction.reply({ content: "❌ Owner only command.", ephemeral: true });
        }

        const code = interaction.options.getString("code");

        await interaction.deferReply({ ephemeral: true });

        try {
            const backup = await getFromDb(`server_backup:${code}`);

            if (!backup) {
                return interaction.editReply({ 
                    content: "❌ Invalid or expired backup code." 
                });
            }

            const embed = createEmbed({
                title: "🔄 Server Restore Started",
                description: `Restoring from backup: \`${code}\``,
                color: "success"
            });

            await interaction.editReply({ embeds: [embed] });

            // Restore Roles
            if (backup.roles && backup.roles.length > 0) {
                for (const roleData of backup.roles) {
                    try {
                        await interaction.guild.roles.create({
                            name: roleData.name,
                            color: roleData.color,
                            hoist: roleData.hoist,
                            permissions: roleData.permissions
                        });
                    } catch (e) {}
                }
            }

            // Restore Channels (Basic Structure)
            if (backup.channels && backup.channels.length > 0) {
                for (const ch of backup.channels) {
                    try {
                        if (ch.type === "category") {
                            await interaction.guild.channels.create({
                                name: ch.name,
                                type: 4, // Category
                                position: ch.position
                            });
                        } else if (ch.type === "text") {
                            await interaction.guild.channels.create({
                                name: ch.name,
                                type: 0, // Text
                                position: ch.position
                            });
                        }
                    } catch (e) {}
                }
            }

            const successEmbed = createEmbed({
                title: "✅ Server Restore Successful",
                description: `Backup \`${code}\` has been restored.`,
                color: "success"
            });

            successEmbed.addFields(
                { name: "Restored", value: 
                    `${backup.roles?.length || 0} Roles\n` +
                    `${backup.channels?.length || 0} Channels\n` +
                    `${backup.ownerMessages?.length || 0} Owner Messages`, 
                inline: false }
            );

            await interaction.editReply({ embeds: [successEmbed] });

            logger.info(`Server restored using backup: ${code}`);

        } catch (error) {
            logger.error("Load server error:", error);
            await interaction.editReply({ 
                content: "❌ Failed to restore server. Check logs." 
            });
        }
    }
};
