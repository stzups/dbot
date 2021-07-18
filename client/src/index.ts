import {Vec3} from 'vec3'
import {BotOptions} from 'mineflayer'
import {strictParseInt, strictParseInts, toVec3} from "./util.js";
import {mine} from "./miner.js";
import {farm} from "./farmer.js";

const environment: Environment = new class implements Environment {
    host = process.argv[2]
    port = process.argv[3]
    username = process.argv[4]
    password = process.argv[5]
}
const mineflayer = require('mineflayer')
require('vec3')

const botOptions: BotOptions = {
    host: environment.host,
    port: parseInt(environment.port),
    username: environment.username,
    password: environment.password,
    checkTimeoutInterval: 1000 * 60 * 5,
}

const ops = [
    'Lem0nPickles',
]

console.log('Creating bot with username ' + botOptions.username)

const bot = mineflayer.createBot(botOptions)

bot.on('error', console.log)

bot.on('login', () => {
    console.log('Logged in to ' + botOptions.host)
})
bot.on('spawn', () => {
    console.log('Spawned')
})

bot.on('kicked', (reason: String) => {
    console.log('Kicked: ' + reason)
})

bot.on('entityHurt', () => {
    console.log('entityHurt')
})

bot.on('death', () => {
    console.log('death')
})





bot.on('death', () => {
    bot.chat('ahhhhhh')
})

bot.on('entityHurt', () => {
    bot.chat('ouch')
})

bot.on('spawn', async () => {
    bot.chat('hello')
/*    await bot.waitForTicks(20)
    let pos = bot.entity.position.floor()
    if (!pos.equals(spawn)) {
        throw new Error('bad pos ' + pos)
    }*/

    bot.on('whisper', async (username: string, message: string) => {
        if (ops.includes(username)) {
            try {
                let split: string[] = message.split(' ')
                if (split.length === 0) {
                    bot.whisper(username, 'No arguments specified')
                }
                switch (split[0]) {
                    case 'mine':
                        bot.whisper(username, 'mining')
                        mine(bot, new Vec3(0, 0, 0), new Vec3(0, 0, 0), new Vec3(1, 0, 0))
                        break
                    case 'farm':
                        let usage = 'Usage: farm start (x y z) length width rows input (x y z)'
                        let start
                        let length
                        let width
                        let rows
                        let input
                        try {
                            start = toVec3(strictParseInts(split, 1, 3))
                            length = strictParseInt(split[4])
                            width = strictParseInt(split[5])
                            rows = strictParseInt(split[6])
                            input = toVec3(strictParseInts(split, 1 + 6, 3))
                        } catch (e) {
                            if (e instanceof Error) {
                                bot.whisper(username, e.message + '. ' + usage)
                                break
                            } else {
                                throw e
                            }
                        }
                        bot.whisper(username, 'Farming ' + length + 'x' + width + ' area with ' + rows + ' rows starting at ' + start)
                        farm(bot, start, length, width, rows, input)
                        break
                    case 'move':
                        let move = async (direction: string, ticks: number) => {
                            bot.setControlState(direction, true)
                            await bot.waitForTicks(ticks)
                            bot.setControlState(direction, false)
                        }
                        let ticks = 5;
                        if (split.length <= 1) {
                            bot.whisper(username, 'Not enough movement arguments')
                            return;
                        }
                        for (let i = 0; i < split[1].length; i++) {
                            let direction: string;
                            let raw = split[1].charAt(i)
                            switch (raw) {
                                case 'w':
                                    direction = 'forward'
                                    break
                                case 'a':
                                    direction = 'left'
                                    break
                                case 's':
                                    direction = 'back'
                                    break
                                case 'd':
                                    direction = 'right'
                                    break
                                case 'j':
                                    direction = 'jump'
                                    break
                                default:
                                    bot.whisper(username, 'Unknown direction ' + raw)
                                    return
                            }
                            await move(direction, direction !== 'jump' ? ticks : 0)
                        }
                        break
                    case 'look':
                        if (split.length !== 4) {
                            bot.whisper(username, 'Incorrect arguments, try look 0 0 0')
                            return
                        }

                        bot.lookAt(bot.entity.position.clone().add(toVec3(strictParseInts(split, 1, 3))))
                        break
                    default:
                        bot.whisper(username, 'Unknown command ' + message)
                }
            } catch (e) {
                if (e instanceof Error) {
                    bot.whisper(username, 'Error: ' + e.message)
                } else {
                    throw e
                }
            }
        }
    })
})