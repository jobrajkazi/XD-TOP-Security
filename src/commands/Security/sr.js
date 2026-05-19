import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { QuickDB } from 'quick.db';

const db = new QuickDB();

export default {
    data: new SlashCommandBuilder()
        .setName('sr')
        .setDescription('Add swear words (Owner Only)')
        .addStringOption(option => 
            option.setName('words')
                .setDescription('Words separated by comma (e.g. bad,badword2)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only Server Owner can use this!", ephemeral: true });
        }

        const words = interaction.options.getString('words').toLowerCase().split(',');
        let badwords = await db.get(`badwords.${interaction.guild.id}`) || [];
        
        badwords = [...new Set([...badwords, ...words.map(w => w.trim())])];

        await db.set(`badwords.${interaction.guild.id}`, badwords);

        await interaction.reply({ 
            content: `✅ Added **${words.length}** bad words successfully!`, 
            ephemeral: true 
        });
    }
};
