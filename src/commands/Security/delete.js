import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

const BOT_OWNERS = ["858482656252657674", "1409273535238508585"];

export default {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete messages of a user (Bot Owner Only)')
        .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
        .addStringOption(opt =>
            opt.setName('all_channels')
                .setDescription('Delete from ALL channels?')
                .addChoices(
                    { name: 'Yes (Everywhere)', value: 'yes' },
                    { name: 'No (Only this channel)', value: 'no' }
                )
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        if (!BOT_OWNERS.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌ **Only the Bot Owner** can use this powerful command!",
                ephemeral: true
            });
        }

        const target = interaction.options.getUser('user');
        const allChannels = interaction.options.getString('all_channels') === 'yes';

        await interaction.reply({ content: `🧹 Deleting messages from **${target.tag}**...`, ephemeral: true });

        if (allChannels) {
            const channels = interaction.guild.channels.cache.filter(ch => ch.isTextBased());
            for (const channel of channels.values()) {
                await deleteUserMessages(channel, target.id);
            }
        } else {
            await deleteUserMessages(interaction.channel, target.id);
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Deletion Completed")
            .setDescription(`Messages from **${target.tag}** have been deleted.`)
            .setColor("Green");

        await interaction.editReply({ content: null, embeds: [embed] });
    }
};

async function deleteUserMessages(channel, userId) {
    if (!channel) return;
    try {
        const messages = await channel.messages.fetch({ limit: 100 });
        const userMsgs = messages.filter(m => m.author.id === userId);
        if (userMsgs.size > 0) {
            await channel.bulkDelete(userMsgs, true).catch(() => {});
        }
    } catch {}
}
