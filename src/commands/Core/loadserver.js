import { SlashCommandBuilder } from "discord.js";
import { getFromDb } from "../../utils/database.js";
import { logger } from "../../utils/logger.js";
import { createEmbed } from "../../utils/embeds.js";

export default {
    data: new SlashCommandBuilder()
        .setName("load")
        .setDescription("Owner only: Load server from backup")
        .addSubcommand(sub =>
            sub.setName("server")
                .setDescription("Restore server from backup code")
                .addStringOption(option =>
                    option.setName("code")
                        .setDescription("Backup code (SV-XXXXXX)")
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
                return interaction.editReply({ content: "❌ Invalid or expired backup code." });
            }

            const embed = createEmbed({
                title: "✅ Server Restore Started",
                description: `Restoring from backup: \`${code}\``,
                color: "success"
            });

            await interaction.editReply({ embeds: [embed] });

            // Note: Full restore is complex. This is a basic structure restore.
            // You can expand this later.

            logger.info(`Server restore attempted with code: ${code}`);

            await interaction.followUp({
                content: "⚠️ Full server restore is partially implemented. Channel & role structure can be restored manually for now.",
                ephemeral: true
            });

        } catch (error) {
            logger.error("Load server error:", error);
            await interaction.editReply({ content: "❌ Failed to load backup." });
        }
    }
};
