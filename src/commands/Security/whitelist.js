import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';

const whitelistFile = path.join(process.cwd(), 'whitelist.json');

// Load whitelist from file (persistent)
let whitelistDB = new Map();

function loadWhitelist() {
    try {
        if (fs.existsSync(whitelistFile)) {
            const data = JSON.parse(fs.readFileSync(whitelistFile, 'utf8'));
            whitelistDB = new Map(Object.entries(data));
        }
    } catch (err) {
        console.log("No whitelist file found, starting fresh.");
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

// Load on startup
loadWhitelist();

export default {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Whitelist a user using password')
        .addUserOption(option => option.setName('user').setDescription('User to whitelist').setRequired(true))
        .addStringOption(option =>
            option.setName('password')
                .setDescription('Enter password')
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
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const password = interaction.options.getString('password');
        const level = interaction.options.getString('level');

        if (password !== "01855109727As") {
            return interaction.reply({ content: "❌ Incorrect Password!", ephemeral: true });
        }

        const key = `${interaction.guild.id}-${target.id}`;
        whitelistDB.set(key, level);
        saveWhitelist(); // Save permanently

        const embed = new EmbedBuilder()
            .setTitle("✅ User Whitelisted Successfully")
            .setColor("Gold")
            .setDescription(`**${target.tag}** has been whitelisted with **${level}** access.\n\n✅ This whitelist is **permanent** until removed.`);

        await interaction.reply({ embeds: [embed] });
    }
};

export { whitelistDB };
