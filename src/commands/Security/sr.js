import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const badwordsDB = new Map();

export default {
    data: new SlashCommandBuilder()
        .setName('sr')
        .setDescription('Add swear words (Owner Only)')
        .addStringOption(option => 
            option.setName('words')
                .setDescription('Words separated by comma')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only Server Owner can use this!", ephemeral: true });
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

export { badwordsDB };
