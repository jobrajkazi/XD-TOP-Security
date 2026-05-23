import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const commands = [];
const commandsPath = path.join(process.cwd(), 'src/commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const commandModule = await import(`file://${filePath}`);
        if (commandModule.default?.data) {
            commands.push(commandModule.default.data.toJSON());
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`🔄 Deploying ${commands.length} commands...`);
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log(`✅ Successfully deployed ${data.length} commands!`);
    } catch (error) {
        console.error('❌ Failed to deploy commands:', error);
    }
})();
