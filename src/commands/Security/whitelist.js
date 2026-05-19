import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const BOT_OWNERS = ["858482656252657674", "1409273535238508585"];

export const whitelistDB = new Map(); // In-memory storage

export default {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Whitelist a user (Bot Owner Only)')
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
        if (!BOT_OWNERS.includes(interaction.user.id)) {
            return interaction.reply({ 
                content: "❌ **Only the Bot Owner** can use this command!", 
                ephemeral: true 
            });
        }

        const target = interaction.options.getUser('user');
        const level = interaction.options.getString('level');

        const key = `${interaction.guild.id}-${target.id}`;
        whitelistDB.set(key, level);

        const embed = new EmbedBuilder()
            .setTitle("✅ User Whitelisted")
            .setColor("Gold")
            .setDescription(`**${target.tag}** (${target.id})\n**Level:** ${level}`);

        await interaction.reply({ embeds: [embed] });
    }
};
