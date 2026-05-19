import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const whitelistDB = new Map(); // In-memory storage

export default {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Whitelist a user (Owner Only)')
        .addUserOption(option => option.setName('user').setDescription('User to whitelist').setRequired(true))
        .addStringOption(option => 
            option.setName('level')
                .setDescription('Permission Level')
                .setRequired(true)
                .addChoices(
                    { name: 'Full Access (Can do everything)', value: 'full' },
                    { name: 'Moderator', value: 'mod' },
                    { name: 'Safe (Normal)', value: 'safe' },
                    { name: 'Spam Allowed Only', value: 'spam' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: "❌ Only Server Owner can use this!", ephemeral: true });
        }

        const target = interaction.options.getUser('user');
        const level = interaction.options.getString('level');

        const key = `${interaction.guild.id}-${target.id}`;
        whitelistDB.set(key, level);

        const embed = new EmbedBuilder()
            .setTitle("✅ User Whitelisted")
            .setColor("Gold")
            .setDescription(`**${target.tag}** has been whitelisted with level: **${level}**`);

        await interaction.reply({ embeds: [embed] });
    }
};

// Export for use in other files
export { whitelistDB };
