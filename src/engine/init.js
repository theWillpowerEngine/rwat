const colors = require("../map/colors")
const makeRenderer = require("../render/renderer")
const makePlayer = require("../player/player")
const makeShip = require("../ship/ship")
const makeScenes = require("../scenes/scenes")
const makeZelazny = require("../zelazny/zelazny")
const makeDirector = require("./director")
const zaWarudo = require("../world/zawarudo")
const registerKeys = require("../keys")
const rpg = require("../system")
const commands = require("./commands")
const detector = require("./detector")
const fs = require('fs')

let cgAll = ["cg1", "cg2", "cg3", "cg4", "cg5", "cg6", "cg7", "cg8", "cg9"]
let cgPicks = []
let cgReturnTo = 0

module.exports = (engine, conf) => {
    var initObject = {
        idx: -1,
        steps: [
            () => {            
                //#region Zelazny (lots of options)
                engine.zelazny = makeZelazny(engine, {}, {
                    macros: {
                        load(pop, expect) {
                            try {
                                var content = fs.readFileSync(`zelazny\\${pop()}`, 'utf8')
                                engine.zelazny.parse(content, true)
                            } catch (ex) {
                                console.log(`Bad attempt to load zelazny: ` + ex)
                            }
                        },
                        cg(pop, expect, tryPop, peek) {
                            var cmd = pop()
                            switch(cmd) {
                                case "start":
                                    //cgPicks.push("cg2")
                                    cgPicks.push(rpg.pickOne(cgAll))
                                    cgPicks.push(rpg.pickOne(cgAll))
                                    cgPicks.push(rpg.pickOne(cgAll))
                                    break
                                case "go":
                                    expect('to')
                                    cgReturnTo = parseInt(pop())
                                    return engine.zelazny.action("go to " + cgPicks[cgReturnTo-1])
                                case "return":
                                    const returnTo = ["", "uncleJack", "winterAway", "leavingHome"]
                                    return engine.zelazny.action("go to " + returnTo[cgReturnTo])
                                case "debug":
                                    require("../debugState")(engine)
                                    return engine.zelazny.action('go to cgDebug')
    
                                default:
                                    throw "Unknown cg command: " + cmd
                            }
                        }
                    },
                    
                    specialLinks: {
                        '$' : `<a class='action-link default-link' data-action='[v __id]'>[v __text]</a><span class='action-span' data-id='[v __id]'>[v __action]</span>`,
                        '*' : `<li class='action-link-li'><a class='action-link' data-action='[v __id]'>[v __text]</a><span class='action-span' data-id='[v __id]'>[v __action]</span></li>`
                    }
                })
                //#endregion            
            },
            
            () => {            
                engine.scenes.loadAll()
                engine.scenes.set(conf.defaultScene)

                backupMaps = JSON.parse(JSON.stringify(engine.maps))
            },

            () => {
                engine.world.generateNewWorld()
                engine.renderer.worldMap.x = engine.renderer.worldMap.y = Math.floor(engine.world.terrainMap.length / 2)

                engine.ship.createDamageModel()
                engine.ship.x = engine.ship.y = Math.floor(engine.world.terrainMap.length / 2)
                engine.ship.z = engine.world.terrainMap[engine.ship.x][engine.ship.y] + 2
            },
            () => {
                registerKeys(engine)

                engine.display = new ROT.Display({
                    width:140,
                    height:60,
                    fontSize: engine.tileSize,
                    fontStyle: "bold",
                    bg: colors.background,
                    forceSquareRatio: true
                })

                document.getElementById("game").appendChild(engine.display.getContainer())
            }
        ],

        andThen(act) {
            act()
            return initObject
        },

        start() {
            engine.player = makePlayer(engine)
            engine.renderer = makeRenderer(engine)
            engine.scenes = makeScenes(engine)
            engine.ship = makeShip(engine)
            engine.world = zaWarudo(engine)
            engine.director = makeDirector(engine)
            engine.commands = commands(engine)
            engine.detector = detector(engine)
        
            return initObject
        },
        next() {
            initObject.idx++
            if(initObject.idx >= initObject.steps.length)
                return null

            initObject.steps[initObject.idx]()
            return initObject
        }
    }

    return initObject
}