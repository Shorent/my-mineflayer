const mineflayer = require("mineflayer");
const navigate = require("mineflayer-navigate")(mineflayer);

const settings = {
    username: "axellawrence1024@gmail.com",
    auth: "microsoft",
    host:"10.0.0.225",
    port:"25565",
};

const bot = mineflayer.createBot(settings);
navigate(bot);
bot.navigate.blocksToAvoid[59] = true;

active = false

bot.on('chat', (username, message) => {
    if (username === bot.username) return
    if (username === "Shorent69420" ){
        if (message === "tf tp to me" && !active) {
            bot.chat("/tpa shorent69420")
        }
        if (message === "come") {
            active = true;
        }
    }
    console.log(username, message);
})

bot.on('kicked', console.log)
bot.on('error', console.log)

while (true){
    if (active){
        const target = bot.players[username].entity;
        bot.navigate.to(target.position);
    }
}
