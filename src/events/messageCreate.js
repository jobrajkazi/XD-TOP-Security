async function punishUser(message, reason, threat) {
    const member = message.member;
    if (!member) return;

    // Delete the bad message
    message.delete().catch(() => {});

    let action = "Warning";
    if (threat === "High") {
        action = "Timeout (10m)";
        await member.timeout(10 * 60 * 1000, reason).catch(() => {});
    }

    // DM to Punished User (Long Version)
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ ERROR EXE OFFICIAL — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "━━━━━━━━━━━━━━", value: `**📌 DETECTED ACTIVITY:**\n• ${reason}` },
            { 
                name: "━━━━━━━━━━━━━━", 
                value: "Our advanced moderation system has detected activity from your account that violates the official community guidelines and security policies of the server.\n\nOur system continuously monitors server activity to maintain a safe, clean, and friendly environment for every member inside the community. Because of your recent activity, your account has been automatically flagged by the protection system.\n\n⚠️ This warning is officially recorded inside the moderation logs." 
            },
            { 
                name: "Please understand:", 
                value: "Repeated violations may result in the following actions without additional warning:\n• Temporary Timeout\n• Permanent Mute\n• Kick From Server\n• Permanent Ban\n• Blacklist From Future Access" 
            }
        )
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM 🛡️" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // DM to Bot Owners (Fixed)
    const BOT_OWNERS = ["858482656252657674", "1409273535238508585"];
    for (const ownerId of BOT_OWNERS) {
        try {
            const owner = await message.client.users.fetch(ownerId);
            const alertEmbed = new EmbedBuilder()
                .setTitle("🚨 ERROR EXE OFFICIAL — SECURITY ALERT")
                .setColor("DarkRed")
                .addFields(
                    { name: "👤 User", value: `${message.author.tag} (${message.author.id})` },
                    { name: "📍 Channel", value: `<#${message.channel.id}>` },
                    { name: "🕒 Time", value: `<t:${Math.floor(Date.now()/1000)}>` },
                    { name: "📌 DETECTED REASON", value: reason },
                    { name: "📊 Threat Level", value: threat },
                    { name: "🤖 System Action Taken", value: action }
                )
                .setFooter({ text: "— ERROR EXE OFFICIAL AUTO SECURITY LOG 🛡️" });

            await owner.send({ embeds: [alertEmbed] });
        } catch (err) {
            console.error(`Could not DM owner ${ownerId}`);
        }
    }
}
