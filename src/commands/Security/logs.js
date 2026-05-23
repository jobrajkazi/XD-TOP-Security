import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';

const logChannelFile = path.join(process.cwd(), 'logChannels.json');
let logChannels = {};

function loadLogChannels() {
    try {
        if (fs.existsSync(logChannelFile)) {
            logChannels = JSON.parse(fs.readFileSync(logChannelFile, 'utf8'));
        }
    } catch (e) {}
}

function saveLogChannels() {
    try {
        fs.writeFileSync(logChannelFile, JSON.stringify(logChannels, null, 2));
    } catch (e) {
        console.error("Failed to save log channels:", e);
    }
}

loadLogChannels();

export { logChannels, saveLogChannels };

export default {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Setup real-time security logs')
        .addSubcommand(sub =>
            sub.setName('setup')
                .setDescription('Set current channel as logs channel')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'setup') {
            const guildId = interaction.guild.id;
            logChannels[guildId] = interaction.channel.id;
            saveLogChannels();

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Logs Channel Setup')
                .setDescription(`This channel is now the **Real-time Security Logs** channel.`);

            await interaction.reply({ embeds: [embed] });
        }
    }
};
