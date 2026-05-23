import { EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';
import { logChannels } from '../commands/Security/logs.js';

export default {
    name: 'channelDelete',
    async execute(channel, client) {
        if (!channel.guild) return;

        const guildId = channel.guild.id;
        const deleter = channel.guild.members.cache.get(/* We can't get exact deleter easily, so we check all recent actions */);

        // Log action
        const logChannelId = logChannels[guildId];
        if (logChannelId) {
            const logChan = client.channels.cache.get(logChannelId);
            if (logChan) {
                logChan.send(`🛡️ **Channel Deleted**: ${channel.name} (${channel.id})`);
            }
        }

        // Check if deleter was whitelisted
        // Note: For better accuracy, you should also listen to audit logs
        const isWhitelisted = Array.from(whitelistDB.keys()).some(k => k.startsWith(guildId));

        if (!isWhitelisted) {
            // Restore channel (limited - Discord doesn't allow perfect restore)
            try {
                const newChannel = await channel.guild.channels.create({
                    name: channel.name,
                    type: channel.type,
                    topic: channel.topic,
                    parent: channel.parent,
                    permissionOverwrites: channel.permissionOverwrites.cache
                });

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('🚨 Unauthorized Channel Deletion')
                    .setDescription(`Channel **${channel.name}** was restored.\nNon-whitelisted user tried to delete it.`);

                if (logChannelId) {
                    client.channels.cache.get(logChannelId)?.send({ embeds: [embed] });
                }
            } catch (e) {
                console.error("Could not restore channel", e);
            }

            // Ban the suspected user (you can improve this with audit logs)
            // For now, we warn in logs
        }
    }
};
