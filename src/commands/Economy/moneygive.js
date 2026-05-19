import { SlashCommandBuilder } from "discord.js";
import { getFromDb, setInDb } from "../../utils/database.js";
import { logger } from "../../utils/logger.js";
import { createEmbed } from "../../utils/embeds.js";

export default {
    data: new SlashCommandBuilder()
        .setName("money")
        .setDescription("Owner only: Give money to any user")
        .addSubcommand(subcommand =>
            subcommand
                .setName("give")
                .setDescription("Give money to a user")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("The user to give money to")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName("amount")
                        .setDescription("Amount of money to give")
                        .setRequired(true)
                        .setMinValue(1)
                )
        ),

    async execute(interaction, guildConfig, client) {
        const ownerIds = process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',').map(id => id.trim()) : [];
        const isOwner = ownerIds.includes(interaction.user.id);

        if (!isOwner) {
            return interaction.reply({
                content: "❌ This command is only available to the bot owner.",
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("amount");

        if (!targetUser) {
            return interaction.reply({ content: "User not found.", ephemeral: true });
        }

        try {
            const economyKey = `economy:${interaction.guildId}:${targetUser.id}`;
            let userEconomy = await getFromDb(economyKey, { wallet: 0, bank: 0 });

            userEconomy.wallet = (userEconomy.wallet || 0) + amount;

            await setInDb(economyKey, userEconomy);

            const embed = createEmbed({
                title: "💰 Money Given",
                description: `Successfully gave **${amount.toLocaleString()}** coins to ${targetUser}`,
                color: "success"
            });

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });

            logger.info(`Owner ${interaction.user.tag} gave ${amount} coins to ${targetUser.tag}`);

        } catch (error) {
            logger.error("Error in /money give:", error);
            await interaction.reply({
                content: "❌ Failed to give money. Please try again.",
                ephemeral: true
            });
        }
    }
};
