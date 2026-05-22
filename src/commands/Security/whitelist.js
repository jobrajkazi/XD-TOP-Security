import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const whitelistDB = new Map();
const PASSWORD = "Mithil123321";

export default {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Whitelist a user using password')
        .addUserOption(option => option.setName('user').setDescription('User to whitelist').setRequired(true))
        .addStringOption(option => 
            option.setName('password')
                .setDescription('Enter password (Mithil123321)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('level')
                .setDescription('Permission Level')
                .setRequired(true)
                .addChoices(
                    { name: 'Full Access', value: 'full' },
                    { name: 'Moderator', value: 'mod' },
                    { name: 'Safe (Normal)', value: 'safe' },
                    { name: 'Spam Allowed', value: 'spam' },
                    { name: 'Bot Access (Full Bot Control)', value: 'botaccess' }
                )),

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const password = interaction.options.getString('password');
        const level = interaction.options.getString('level');

        if (password !== PASSWORD) {
            return interaction.reply({ content: "❌ Incorrect Password!", ephemeral: true });
        }

        const key = `${interaction.guild.id}-${target.id}`;
        whitelistDB.set(key, level);

        const embed = new EmbedBuilder()
            .setTitle("✅ User Whitelisted Successfully")
            .setColor("Gold")
            .setDescription(`**${target.tag}** has been whitelisted with **${level}** access.`);

        await interaction.reply({ embeds: [embed] });
    }
};

export { whitelistDB };
