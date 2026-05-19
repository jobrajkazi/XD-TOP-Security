const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete messages of a user')
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
        if (interaction.user.id !== interaction.guild.ownerId) 
            return interaction.reply({ content: "❌ Only Server Owner can use this!", ephemeral: true });

        const target = interaction.options.getUser('user');
        const allChannels = interaction.options.getString('all_channels') === 'yes';

        await interaction.reply({ content: `🧹 Deleting messages of **${target.tag}**...`, ephemeral: true });

        if (allChannels) {
            const channels = interaction.guild.channels.cache.filter(ch => ch.isTextBased());
            for (const channel of channels.values()) {
                await deleteUserMessages(channel, target.id);
            }
        } else {
            await deleteUserMessages(interaction.channel, target.id);
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ Deletion Complete")
            .setDescription(`Messages from **${target.tag}** have been deleted.`)
            .setColor("Green");

        interaction.editReply({ content: null, embeds: [embed] });
    }
};

async function deleteUserMessages(channel, userId) {
    if (!channel) return;
    try {
        const messages = await channel.messages.fetch({ limit: 100 });
        const userMsgs = messages.filter(m => m.author.id === userId);
        if (userMsgs.size > 0) await channel.bulkDelete(userMsgs, true);
    } catch {}
}
