const colors = require("./map/colors")
const makeRenderer = require("./render/renderer")
const makePlayer = require("./player/player")
const makeShip = require("./ship/ship")
const makeScenes = require("./scenes/scenes")
const makeZelazny = require("./zelazny/zelazny")
const makeDirector = require("./crew/director")
const makeCrew = require("./crew/baseCrew")
const zaWarudo = require("./world/zawarudo")
const registerKeys = require("./keys")
const rpg = require("./system")
const Color = require('color')
const fs = require('fs')
let { ipcRenderer } = require("electron")

function applyObjectTo(base, toApply) {
    for(var prop in toApply) {
        if(Array.isArray(toApply[prop])) {
            var a = toApply[prop]
            for(var i of a) {
                try {
                    if(!base[prop].includes(i)) {
                        base[prop].push(i)
                    }
                } catch(e) {console.warn("Potential problem in applyObjectTo: " + e)}
            }
        } else if(typeof toApply[prop] === 'object')
            base[prop] = applyObjectTo(base[prop], toApply[prop])
        else 
            base[prop] = toApply[prop]
    }

    return base
}
function extractDeltaObject(base, changed) {
    var retVal = {}
    
    for(var prop in changed) {
        if(typeof changed[prop] === 'object') {
            var val = extractDeltaObject(base[prop] || {}, changed[prop])
            if(Object.keys(val).length > 0)
                retVal[prop] = val    
        }
        else {
            if(base[prop] != changed[prop])
                retVal[prop] = changed[prop]
        }
    }

    return retVal

}

module.exports = (logger, opts) => {
    var conf = {
        debug: false,   //use:  if(engine.conf.debug) debugger

        defaultScene: "blank",
        forceOfGravity: 2.396,

        ...opts
    }

    let backupMaps = null
    let cgAll = ["cg1", "cg2", "cg3", "cg4", "cg5", "cg6", "cg7", "cg8", "cg9"]
    let cgPicks = []
    let cgReturnTo = 0

    var that = {
        conf,
        gameOver: false,
        tileSize: 20,

        zelazny: null,

        maps: {

        },
        map: null,
        scenes: null,

        world: null,

        display: null,
        lights: null,
        renderer: null,
        
        logText: '',
        log(msg) {
            that.logText += `<span class='log-item'>${(msg || '')}</span>`
        },

        player: null,
        ship: null,
        crew: [],
        director: null,
        
        lastOffsetX: 0,
        lastOffsetY: 0,

        checkLOS(x, y, x1, y1, map) {
            if(!map) map = that.map
            if(!x1) x1 = that.player.x
            if(!y1) y1 = that.player.y
            var pts = map.getPointsBetween(x, y, x1, y1)
            for(var pt of pts) {
                if(pt[0] == that.player.x && pt[1] == that.player.y)
                    return false

                var tile = map.tiles[pt[0]][pt[1]] 
                if(tile && tile.solid && !tile.transparent)
                    return false
                else if (tile && !tile.solid && tile.notTransparent)
                    return false
            }
            return true
        },

        //More permissive LOS: adds expansive walls
        extendedCheckLOS(x, y, x1, y1, map) {
            if(!map) map = that.map
            if(!x1) x1 = that.player.x
            if(!y1) y1 = that.player.y
            if(that.checkLOS(x, y, x1, y1))
                return true

            var dX = 0, dY = 0
            if(x > x1) dX = -1
            if(x < x1) dX = 1
            if(y > y1) dY = -1
            if(y < y1) dY = 1
            
            if(that.checkLOS(x1, y1, x + dX, y) && ((!map.tiles[x+dX][y].solid && !map.tiles[x+dX][y].notTransparent) || map.tiles[x+dX][y].transparent))
                return true
            if(that.checkLOS(x1, y1, x, y + dY) && ((!map.tiles[x][y+dY].solid && !map.tiles[x][y+dY].notTransparent) || map.tiles[x][y+dY].transparent))
                return true
            if(that.checkLOS(x1, y1, x+dX, y + dY) && ((!map.tiles[x+dX][y+dY].solid && !map.tiles[x+dX][y+dY].notTransparent) || map.tiles[x+dX][y+dY].transparent))
                return true

            return false
        },

        boundsCheck(x, y, map) {
            var hadMap = true
            if(!map) {
                hadMap = false
                map = that.map
            }

            if(x < 0 || y < 0)
                return { ib: false }
            if(x >= that.map.width || y >= that.map.height)
                return { ib: false } 
            
            if(!hadMap || map.name == that.map.name) {
                var tile = that.renderer.getTileAt(x, y)
                if(tile.solid)
                    return { ib: false, tile: tile }
            } else {
                var tile = map.tiles[x][y]
                if(tile.solid)
                    return { ib: false, tile: tile }
            }

            return {ib: true}
        },
        rangeBetween(x, y, x1, y1, map) {
            if(!map) map = that.map
            return that.map.getPointsBetween(x, y, x1, y1).length + 1
        },

        interact(npc, x, y) {
            var tile = that.map.tiles[x][y]
            if(!tile.interactive)
                return

            if(!npc) {
                tile.handler(that, tile)
            } else 
                throw "NPCs don't know how to interact yet"
        },

        init(progressCallback) {
            var pg = (step, data) => {
                if(progressCallback)
                    progressCallback(step, data)
            }

            pg(1, "Starting new game")
            
            that.player = makePlayer(that)
            that.renderer = makeRenderer(that)
            that.scenes = makeScenes(that)
            that.ship = makeShip(that)
            that.world = zaWarudo(that)
            that.director = makeDirector(that)

            //#region Zelazny (lots of options)
            that.zelazny = makeZelazny(that, {}, {
                macros: {
                    load(pop, expect) {
                        try {
                            var content = fs.readFileSync(`zelazny\\${pop()}`, 'utf8')
                            that.zelazny.parse(content, true)
                        } catch (ex) {
                            console.log(`Bad attempt to load zelazny: ` + ex)
                        }
                    },
                    cg(pop, expect, tryPop, peek) {
                        var cmd = pop()
                        switch(cmd) {
                            case "start":
                                //cgPicks.push("cg1")
                                cgPicks.push(rpg.pickOne(cgAll))
                                cgPicks.push(rpg.pickOne(cgAll))
                                cgPicks.push(rpg.pickOne(cgAll))
                                break
                            case "go":
                                expect('to')
                                cgReturnTo = parseInt(pop())
                                return that.zelazny.action("go to " + cgPicks[cgReturnTo-1])
                            case "return":
                                const returnTo = ["", "uncleJack", "winterAway", "leavingHome"]
                                return that.zelazny.action("go to " + returnTo[cgReturnTo])
                            case "debug":
                                require("./debugState")(that)
                                return that.zelazny.action('go to cgDebug')

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
            pg(2, "Preinitialization complete")

            that.ship.createDamageModel()
            pg(5, "Ship damage model initialized")

            var sceneCount = that.scenes.loadAll()
            that.scenes.set(conf.defaultScene)
            pg(10, `Loaded ${sceneCount} scenes`)

            backupMaps = JSON.parse(JSON.stringify(that.maps))
            pg(15, 'Backed up initial scenes for delta calculations')

            registerKeys(that)
            pg(50, "Set initial game state")

            pg(99, "Initialization done, installing into UI")
            that.display = new ROT.Display({
                width:140,
                height:60,
                fontSize: that.tileSize,
                fontStyle: "bold",
                bg: colors.background,
                forceSquareRatio: true
            })
            document.getElementById("game").appendChild(that.display.getContainer())

            pg(100, "Initialization complete!")
            return conf
        },

        async save() {
            var zel = that.zelazny
            delete that.zelazny
            var eng = JSON.parse(JSON.stringify(that))
            that["zelazny"] = zel
            currentScene = eng.scenes.current
            
            delete eng.display
            delete eng.scenes
            delete eng.map
            delete eng.lights
            delete eng.director
            eng["curScene"] = currentScene
            eng["zelState"] = zel.state

            eng.maps = extractDeltaObject(backupMaps, eng.maps)

            await ipcRenderer.invoke("save", JSON.stringify(eng))
            that.log("Game saved.")
        },
        async load() {
            var json = await ipcRenderer.invoke("load", JSON.stringify(that))
            var loaded = JSON.parse(json)
            
            var zs = loaded.zelState
            delete loaded.zelState

            applyObjectTo(that, loaded)

            var cs = that.curScene
            that.scenes.set(cs)
            delete that.curScene

            applyObjectTo(that.zelazny.state, zs)

            for(var i=0; i<that.crew.length; i++)
                that.crew[i] = makeCrew(that, that.crew[i])
            
            that.log("Loaded game.")
        },
        async getHelp(topic) {
            return await ipcRenderer.invoke("help", topic)
        },
        async getZelazny(group, node) {
            return await ipcRenderer.invoke("zelazny", group + "\\" + node)
        },
        async getIcon(icon) {
            return await ipcRenderer.invoke("icon", icon)
        },

        async render(ticks) {
            if(!ticks) ticks = 1
            if(that.gameOver)
                throw that.gameOver
                
            var start = new Date()
            var $game = $("#game")
            
            for(var i=0; i<ticks; i++) {
                that.ship.tick()
                that.world.tick()
                that.director.tick()
            }

            if(ticks > 1)
                that.log(ticks + " ticks pass.")
            
            var displayWidth = Math.floor($game.width() / that.tileSize),
                displayHeight = Math.floor($game.height() / that.tileSize)

            var offsetX = 0, offsetY = 0
            var pX = that.player.x, pY = that.player.y

            var map = that.map
            if(map && map.tickHandler) map.tickHandler()

            if(map.width < displayWidth)
                displayWidth = map.width
            else
                offsetX = pX - Math.floor(displayWidth / 2)
            if(map.height < displayHeight)  
                displayHeight = map.height
            else
                offsetY = pY - Math.floor(displayHeight / 2)

            if(offsetX < 0) offsetX = 0
            if(offsetX > map.width - displayWidth) offsetX = map.width - displayWidth
            if(offsetY < 0) offsetY = 0
            if(offsetY > map.height - displayHeight) offsetY = map.height - displayHeight

            that.lastOffsetX = offsetX
            that.lastOffsetY = offsetY

            that.display.clear()

            for(var x=0; x<displayWidth; x++)
                for(var y=0; y<displayHeight; y++) {
                    let tile = that.renderer.getTileAt(x + offsetX, y + offsetY) 
                    if(!tile) continue
                    var c = tile.char

                    if(tile.isPC && that.player.lightOn) {
                        that.player.lightFuel -= 1
                        if(that.player.lightFuel == 0) {
                            that.player.lightOn = false
                            that.log("Your lantern sputters and begins to die as it runs out of fuel.")
                            tile.bg = null
                        }
                    }
                    
                    that.display.draw(x, y, c, tile.color, tile.bg)
                }

            logger(that.logText)
            that.logText = ''
            await ui.updateUI()

            console.log("Tick Duration: " + Math.abs((new Date().getTime() - start.getTime())) + " ms")

        }
    }

    return that
}