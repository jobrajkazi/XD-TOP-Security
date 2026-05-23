import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';

const whitelistFile = path.join(process.cwd(), 'whitelist.json');

let whitelistDB = new Map();

function loadWhitelist() {
    try {
        if (fs.existsSync(whitelistFile)) {
            const data = JSON.parse(fs.readFileSync(whitelistFile, 'utf8'));
            whitelistDB = new Map(Object.entries(data));
        }
    } catch (err) {
        console.log("No whitelist file found.");
    }
}

function saveWhitelist() {
    try {
        const data = Object.fromEntries(whitelistDB);
        fs.writeFileSync(whitelistFile, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Failed to save whitelist:", err);
    }
}

loadWhitelist();

export { whitelistDB, loadWhitelist, saveWhitelist };

export default {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Whitelist a user')
        .addUserOption(option => option.setName('user').setDescription('User to whitelist').setRequired(true))
        .addStringOption(option =>
            option.setName('level')
                .setDescription('Permission Level')
                .setRequired(true)
                .addChoices(
                    { name: 'Full Access', value: 'full' },
                    { name: 'Moderator', value: 'mod' },
                    { name: 'Safe User', value: 'safe' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const level = interaction.options.getString('level');
        const key = `${interaction.guild.id}-${target.id}`;

        whitelistDB.set(key, { level, whitelistedBy: interaction.user.id, timestamp: Date.now() });
        saveWhitelist();

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('✅ User Whitelisted')
            .setDescription(`**${target.tag}** has been whitelisted with **${level}** access.`);

        await interaction.reply({ embeds: [embed] });
    }
};
