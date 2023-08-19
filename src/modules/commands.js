import dotenv from 'dotenv';
dotenv.config();

const authorizedPlayers = process.env.AUTHORIZED_PLAYERS.split(' ')
const functions = {
    /**
    * @param {import('mineflayer').Bot} bot
    * @param {Array} message
    */
    say: (bot, message) => {
        message = message.join(' ');
        bot.chat(message);
    }
}

/**
    * @param {import("mineflayer").Bot} bot
    * @param {string} username
    * @param {string} command
    */
export function executeCommand(bot, username, command){
    return new Promise((resolve, reject) => {
        if (!authorizedPlayers.includes(username)){
            reject("Player not authorized.");
            return;
        }
        command = command.split(' ');
        command[0] = Object.getOwnPropertyNames(functions)
            .find( (functionName) => functionName == command[0] );
        if (command[0] === undefined){
            reject("Command not recognized");
            return;
        } 
        eval(functions + '.' + command[0] + '(' + bot + ',' + command + ')');
    });
}
