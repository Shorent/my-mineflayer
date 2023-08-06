const vec3 = require("vec3");
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const mineflayer = require("mineflayer");
const autoeat = require('mineflayer-auto-eat').plugin
const mineArea = require('./miner.js')

const settings = {
    username: "axellawrence1024@gmail.com",
    auth: "microsoft",
    host:"10.0.0.225",
    port:"25565",
};

const bot = mineflayer.createBot(settings);
bot.loadPlugin(pathfinder);
bot.loadPlugin(autoeat);

bot.once('spawn', () => {
    const defaultMove = new Movements(bot);
    defaultMove.allowSprinting= false
    defaultMove.allowParkour = true
    bot.pathfinder.setMovements(defaultMove);
})

bot.on('whisper', (username, message) => {
    console.log(username, message);
    if (username === bot.username) return
    if (username === "Shorent69420" ){
        if (message === "tf tp to me") {
            bot.chat("/tpa shorent69420")
        }
        if (message.startsWith("mine ")) {
            const messageProperties = message.substring(5).split(" ")
            const area = vec3(parseInt(messageProperties[0], 10),parseInt(messageProperties[1], 10),parseInt(messageProperties[2], 10))
            console.log(area)
            mineArea(bot, area)
        }
    }
})

bot.on('autoeat_started', (item, offhand) => {
    console.log(`Eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})

bot.on('autoeat_finished', (item, offhand) => {
    console.log(`Finished eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})

bot.on('autoeat_error', console.error)
