import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';
import { logChannels } from '../commands/Security/logs.js';

export default {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || !message.author) return;

        const guildId = message.guild.id;
        const deleterId = message.author.id; // Note: message.author is the original author

        const key = `${guildId}-${deleterId}`;

        // ✅ Whitelisted = Do nothing
        if (whitelistDB.has(key)) return;

        // ✅ Deleting own message = Allowed, no punishment
        // (Discord event doesn't easily give "who deleted it" if not the author)

        const logChannelId = logChannels[guildId];
        if (logChannelId) {
            const logChan = message.client.channels.cache.get(logChannelId);
            if (logChan) {
                logChan.send(`🗑️ Message deleted by <@${deleterId}> in <#${message.channel.id}>`);
            }
        }
    }
};
