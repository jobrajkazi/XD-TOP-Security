import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';

const messageCache = new Map(); // Temporary cache

// Cache messages when sent
export function cacheMessage(message) {
    if (message.author.bot || !message.guild) return;
    const key = `${message.guild.id}-${message.channel.id}`;
    if (!messageCache.has(key)) messageCache.set(key, new Map());
    messageCache.get(key).set(message.id, message);
}

export default {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild) return;

        const deleter = message.author; // Sometimes null on bulk delete
        const guildId = message.guild.id;
        const key = `${guildId}-${deleter?.id}`;

        // If whitelisted → allow delete
        if (deleter && whitelistDB.has(key)) return;

        // Try to restore the message
        if (message.content || message.attachments.size > 0) {
            const restoredEmbed = new EmbedBuilder()
                .setAuthor({ name: `${message.author?.tag || 'Unknown'} (Deleted by non-whitelisted)`, iconURL: message.author?.displayAvatarURL() })
                .setDescription(message.content || "*No text content*")
                .setColor("Red")
                .setFooter({ text: "🛡️ Auto Restored by Error Exe Security" })
                .setTimestamp();

            if (message.attachments.size > 0) {
                restoredEmbed.setImage(message.attachments.first().url);
            }

            message.channel.send({ embeds: [restoredEmbed] }).catch(() => {});
        }

        // Punish the deleter if we know who it is
        if (deleter && !whitelistDB.has(key)) {
            const member = await message.guild.members.fetch(deleter.id).catch(() => null);
            if (member) {
                await member.timeout(5 * 60 * 1000, "Unauthorized Delete (Anti-Nuke)").catch(() => {});
            }
        }
    }
};
