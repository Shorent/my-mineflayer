const vec3 = require('vec3')
const goals = require('mineflayer-pathfinder').goals

async function mineArea (bot, relativePosition) {
    const area = new Area(bot.entity.position, bot.entity.position.plus(relativePosition))
    let chunks = chunkArea(vec3(4,2,4),area);
    console.log("Mining Area: ", area.startPos, area.endPos)
    const originalPos = bot.entity.position
    for (const chunk of chunks){
        await mineChunk(bot, originalPos, chunk);
    }
}

function mineChunk(bot, originalPos, relativeChunk){
    return new Promise( async (resolve, reject) => {
    console.log("Mining chunk: ", relativeChunk)
    let blockPositions = new Array()
    for (let z = relativeChunk.startPos.z; z < relativeChunk.endPos.z; z++) 
        for (let y = relativeChunk.startPos.y; y < relativeChunk.endPos.y; y++)
            for (let x = relativeChunk.startPos.x; x < relativeChunk.endPos.x; x++)
                blockPositions.push(vec3(x, y, z).plus(originalPos))
    console.log(blockPositions.length)
    for await (const blockPosition of blockPositions){
        console.log("Mining ", blockPosition)
        await mineBlockIfCapable(bot, blockPosition)
    }
    resolve()
    })
}

function chunkArea(chunkSize, area){
    console.log("generating Chunks...")
    console.log(chunkSize, area)
    const chunksX = area.getXLen() / chunkSize.x
    const chunksY = area.getYLen() / chunkSize.y
    const chunksZ = area.getZLen() / chunkSize.z
    console.log("chunk amt: ", chunksX, chunksY, chunksZ)
    const chunks = new Array();
    //need to add remainder in the case that chunksX...etc is float
    for (let y = 0; y < chunksY; y++)
        for (let z = 0; z < chunksZ; z++)
            for (let x = 0; x < chunksX; x++)
                chunks.push( new Area(vec3(x*chunkSize.x,y*chunkSize.y,z*chunkSize.z),
                    vec3(x*chunkSize.x+chunkSize.x,y*chunkSize.y+chunkSize.y,z*chunkSize.z+chunkSize.z)))
    console.log("generated chunks: ", chunks)
    return chunks;
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

class Area {
    constructor(startPos, endPos){
        this.startPos = startPos
        this.endPos = endPos
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
