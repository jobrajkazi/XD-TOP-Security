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
        try {
            const command = await import(`file://${filePath}`);
            if (command.default?.data) {
                commands.push(command.default.data.toJSON());
            }
        } catch (err) {
            console.error(`Error loading ${file}:`, err.message);
        }
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(`🔄 Started refreshing ${commands.length} slash commands...`);
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log(`✅ Successfully deployed ${commands.length} commands!`);
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();
