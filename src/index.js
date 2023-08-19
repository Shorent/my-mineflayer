import dotenv from 'dotenv';
import mineflayer from 'mineflayer';
import { executeCommand } from './modules/commands.js';

dotenv.config();

const bot = mineflayer.createBot({
    username: process.env.EMAIL,
    auth: "microsoft",
    host: process.env.MINECRAFT_HOST,
    port: process.env.MINECRAFT_PORT
});

bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(username, message);
    executeCommand(bot, username, message);
});

bot.once('spawn', () => {
    const botPos = bot.entity.position;
    console.log("Spawned in server at: ", botPos.toArray());
    console.log("Active players: ", Object.keys(bot.players));
});
