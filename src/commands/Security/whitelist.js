const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Whitelist a user (Owner Only)')
        .addUserOption(option => option.setName('user').setDescription('User to whitelist').setRequired(true))
        .addStringOption(option => 
            option.setName('level')
                .setDescription('Permission Level')
                .setRequired(true)
                .addChoices(
                    { name: 'Full Access (Everything)', value: 'full' },
                    { name: 'Moderator', value: 'mod' },
                    { name: 'Safe (Normal User)', value: 'safe' },
                    { name: 'Spam Allowed', value: 'spam' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only Server Owner can use this!", ephemeral: true });
        }

        const target = interaction.options.getUser('user');
        const level = interaction.options.getString('level');

        await db.set(`whitelist.${interaction.guild.id}.${target.id}`, level);

        const embed = new EmbedBuilder()
            .setTitle("✅ User Whitelisted")
            .setColor("Gold")
            .setDescription(`**${target.tag}** has been whitelisted with level: **${level}**`);

        await interaction.reply({ embeds: [embed] });
    }
};
