const vec3 = require('vec3')
const goals = require('mineflayer-pathfinder').goals

async function mineArea (bot, relativePosition) {
    const area = new Area(bot.entity.position,bot.entity.position.plus(relativePosition))
    let chunks = chunkArea(vec3(4,2,4),area);
    const originalBotPos = bot.entity.position
    for (const chunk of chunks){
        await mineChunk(bot, originalBotPos, chunk);
    }
}

function mineChunk(bot, originalPos, relativeChunk){
    return new Promise( async (resolve, reject) => {
        let blockPositions = new Array()
        const dirSignx = Math.sign(relativeChunk.endPos.x - relativeChunk.startPos.x)
        const dirSigny = Math.sign(relativeChunk.endPos.y - relativeChunk.startPos.y)
        const dirSignz = Math.sign(relativeChunk.endPos.z - relativeChunk.startPos.z)
        for (let z = Math.abs(relativeChunk.startPos.z); z < Math.abs(relativeChunk.endPos.z); z++) 
            for (let y = Math.abs(relativeChunk.startPos.y); y < Math.abs(relativeChunk.endPos.y); y++)
                for (let x = Math.abs(relativeChunk.startPos.x); x < Math.abs(relativeChunk.endPos.x); x++)
                    blockPositions.push(vec3(x*dirSignx, y*dirSigny, z*dirSignz).plus(originalPos))
        console.log(blockPositions)
        for await (const blockPosition of blockPositions){
            await mineBlockIfCapable(bot, blockPosition)
        }
        resolve()
    })
}

function chunkArea(chunkSize, area){
    const chunksX = area.getXLen() / chunkSize.x
    const chunksY = area.getYLen() / chunkSize.y
    const chunksZ = area.getZLen() / chunkSize.z
    const chunks = new Array();
    const chunkXSizeSigned = chunkSize.x*Math.sign(area.relativePosition.x)
    const chunkYSizeSigned = chunkSize.y*Math.sign(area.relativePosition.y)
    const chunkZSizeSigned = chunkSize.z*Math.sign(area.relativePosition.z)
    //need to add remainder in the case that chunksX...etc is float
    for (let y = 0; y < chunksY; y++)
        for (let z = 0; z < chunksZ; z++)
            for (let x = 0; x < chunksX; x++)
                chunks.push( new Area(
                    vec3(
                        x*chunkXSizeSigned,
                        y*chunkYSizeSigned,
                        z*chunkZSizeSigned
                    ),
                    vec3(
                        x*chunkXSizeSigned+chunkXSizeSigned,
                        y*chunkYSizeSigned+chunkYSizeSigned,
                        z*chunkZSizeSigned+chunkZSizeSigned
                    )
                ))
    chunks.sort(sortByY);
    return chunks
}

function mineBlockIfCapable(bot, blockPosition){
    return new Promise( async (resolve, reject) => {
        const block = bot.blockAt(blockPosition);
        if (block.name === "air") {
            resolve(null);
            return;
        };
        console.log("Mining: ", block.name);
        let item = bot.pathfinder.bestHarvestTool(block);
        console.log("Best Harvest Tool: ", item?.name)
        if (item !== null) {
            let success = false
            while (!success) {
                success = true
                await bot.pathfinder.goto(new goals.GoalNear(blockPosition.x,blockPosition.y,blockPosition.z,4))
                    .catch((err) => {
                        console.log("rerouting to goal")
                        success = false
                    });
            }
            await bot.equip(item,"hand");
            await bot.dig(block);
            console.log("Mined!")
            resolve(null)
        }
        reject(null)
    });
}

function sortByY(a,b){
    return b.startPos.y - a.startPos.y
}

class Area {
    constructor(startPos, endPos){
        this.startPos = startPos
        this.endPos = endPos
        this.relativePosition = endPos.minus(startPos)
    }
    
    getXLen(){
        return Math.abs(this.startPos.x - this.endPos.x)
    }
    
    getYLen(){
        return Math.abs(this.startPos.y - this.endPos.y)
    }
    
    getZLen(){
        return Math.abs(this.startPos.z - this.endPos.z)
    }
}

module.exports = mineArea
