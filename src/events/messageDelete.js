import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';

const messageCache = new Map(); // Temporary cache

// Cache messages when sent (keep this for potential future use)
export function cacheMessage(message) {
    if (message.author.bot || !message.guild) return;
    const key = `${message.guild.id}-${message.channel.id}`;
    if (!messageCache.has(key)) messageCache.set(key, new Map());
    messageCache.get(key).set(message.id, message);
}

export default {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || !message.author) return;

        const deleter = message.author;
        const guildId = message.guild.id;
        const key = `${guildId}-${deleter.id}`;

        // ✅ If whitelisted → do nothing
        if (whitelistDB.has(key)) return;

        // ✅ If deleting their OWN message → do NOTHING (your request)
        // No restore, no timeout, no punishment
        // (You can remove the rest of the function if you want zero action)

        // Optional: Only act on deletes that are NOT by the author (e.g. admins deleting others' messages)
        // For now, keeping it minimal as per your request
        console.log(`[Security] User ${deleter.tag} deleted their own message - no action taken.`);
    }
};
