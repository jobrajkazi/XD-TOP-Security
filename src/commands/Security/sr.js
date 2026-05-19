import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const BOT_OWNERS = ["858482656252657674", "1409273535238508585", "1503475813767577721"];

const badwordsDB = new Map(); // In-memory storage

export default {
    data: new SlashCommandBuilder()
        .setName('sr')
        .setDescription('Add swear words (Bot Owner Only)')
        .addStringOption(option =>
            option.setName('words')
                .setDescription('Words separated by comma')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!BOT_OWNERS.includes(interaction.user.id)) {
            return interaction.reply({ content: "❌ Only Bot Owner can use this!", ephemeral: true });
        }

        const words = interaction.options.getString('words').toLowerCase().split(',');
        const guildId = interaction.guild.id;

        let badwords = badwordsDB.get(guildId) || [];
        badwords = [...new Set([...badwords, ...words.map(w => w.trim())])];
        badwordsDB.set(guildId, badwords);

        await interaction.reply({
            content: `✅ Successfully added **${words.length}** bad words!`,
            ephemeral: true
        });
    }
};

// Export for use in messageCreate
export { badwordsDB };
