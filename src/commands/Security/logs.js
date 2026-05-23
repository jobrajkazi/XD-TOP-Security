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
    fs.writeFileSync(logChannelFile, JSON.stringify(logChannels, null, 2));
}

loadLogChannels();

export { logChannels, saveLogChannels };

export default {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Setup real-time security logs channel')
        .addSubcommand(sub =>
            sub.setName('setup')
                .setDescription('Set this channel as logs channel')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'setup') {
            logChannels[interaction.guild.id] = interaction.channel.id;
            saveLogChannels();

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('📋 Logs Channel Set')
                .setDescription(`This channel (${interaction.channel}) will now receive **real-time bot actions**.`);

            await interaction.reply({ embeds: [embed] });
        }
    }
};
