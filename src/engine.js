const colors = require("./map/colors.js")
const makeRenderer = require("./render/renderer.js")
const makePlayer = require("./player/player.js")
const makeShip = require("./ship/ship.js")
const makeScenes = require("./scenes/scenes.js")
const makeZelazny = require("./zelazny/zelazny.js")
const registerKeys = require("./keys.js")
const Color = require('color')
let { ipcRenderer } = require("electron")

function applyObjectTo(base, toApply) {
    for(var prop in toApply) {
        if(typeof toApply[prop] === 'object')
            base[prop] = applyObjectTo(base[prop], toApply[prop])
        else    
            base[prop] = toApply[prop]
    }

    return base
}
function extractDeltaObject(base, changed) {
    var retVal = {}
    
    for(var prop in changed) {
        if(typeof changed[prop] === 'object')
            retVal[prop] = extractDeltaObject(base[prop] || {}, changed[prop])
        else {
            if(base[prop] != changed[prop])
                retVal[prop] = changed[prop]
        }
    }

    return retVal

}

module.exports = (logger, opts) => {
    var conf = {
        defaultScene: "engineRoom",

        ...opts
    }

    let backupMaps = null

    var that = {
        gameOver: false,
        tileSize: 20,

        zelazny: null,

        maps: {

        },
        map: null,
        scenes: null,

        display: null,
        lights: null,
        renderer: null,
        
        logText: '',
        log(msg) {
            that.logText += `<span class='log-item'>${(msg || '')}</span>`
        },

        player: null,
        ship: null,

        lastOffsetX: 0,
        lastOffsetY: 0,

        checkLOS(x, y, x1, y1) {
            if(!x1) x1 = that.player.x
            if(!y1) y1 = that.player.y
            var pts = that.map.getPointsBetween(x, y, x1, y1)
            for(var pt of pts) {
                if(pt[0] == that.player.x && pt[1] == that.player.y)
                    return false

                var tile = that.map.tiles[pt[0]][pt[1]] 
                if(tile && tile.solid && !tile.transparent)
                    return false
            }
            return true
        },

        //More permissive LOS: adds expansive walls
        extendedCheckLOS(x, y, x1, y1) {
            if(!x1) x1 = that.player.x
            if(!y1) y1 = that.player.y
            if(that.checkLOS(x, y, x1, y1))
                return true

            var dX = 0, dY = 0
            if(x > x1) dX = -1
            if(x < x1) dX = 1
            if(y > y1) dY = -1
            if(y < y1) dY = 1
            
            debugger
            if(that.checkLOS(x1, y1, x + dX, y))
                return true
            if(that.checkLOS(x1, y1, x, y + dY))
                return true

            return false
        },

        boundsCheck(x, y) {
            if(x < 0 || y < 0)
                return { ib: false }
            if(x >= that.map.width || y >= that.map.height)
                return { ib: false } 
            if(that.map.tiles[x][y].solid)
                return { ib: false, tile: that.map.tiles[x][y] }
    
            return {ib: true}
        },
        rangeBetween(x, y, x1, y1) {
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
            that.zelazny = makeZelazny()
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
            });
            document.getElementById("game").appendChild(that.display.getContainer()); 

            pg(100, "Initialization complete!")
            return conf
        },

        async save() {
            var eng = JSON.parse(JSON.stringify(that))
            delete eng.display
            delete eng.scenes
            delete eng.map
            delete eng.lights
            delete eng.zelazny.parser
            delete eng.zelazny.nodes

            eng.maps = extractDeltaObject(backupMaps, eng.maps)

            await ipcRenderer.invoke("save", JSON.stringify(eng))
            that.log("Game saved.")
        },
        async load() {
            var json = await ipcRenderer.invoke("load", JSON.stringify(that))
            var loaded = JSON.parse(json)
            
            applyObjectTo(that, loaded)
            that.log("Loaded game.")
        },
        async getHelp(topic) {
            return await ipcRenderer.invoke("help", topic)
        },

        render() {
            if(that.gameOver)
                throw that.gameOver
                
            var start = new Date()
            var $game = $("#game")
            that.ship.tick()
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
            ui.updateUI()

            console.log("Tick Duration: " + Math.abs((new Date().getTime() - start.getTime())) + " ms")

        }
    }

    return that
}