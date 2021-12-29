const colors = require("./map/colors")
const rpg = require("./system")
const makeCrew = require("./crew/baseCrew")
const Color = require('color')
let { ipcRenderer } = require("electron")
const renderModes = require("./render/renderModes")
const initter = require("./engine/init")

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

    if(!base)
        return base
    
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

    const that = {
        conf,
        gameOver: false,
        tileSize: 20,

        zelazny: null,
        headingMaps: [],

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

        commands: null,

        player: null,
        ship: null,
        crew: [],

        director: null,
        detector: null,

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

        //Optimization todo:  cache these per tick
        getPathfindingMap(map) {
            var hadMap = true
            if(!map) {
                hadMap = false
                map = that.map
            }

            var ret = []
            for(var x=0; x<map.width; x++) {
                ret[x] = []
                for(var y=0; y<map.height; y++) {
                    if(!hadMap || map.name == that.map.name) {
                        var tile = that.renderer.getTileAt(x, y)
                        ret[x][y] = tile.solid ? 1 : 0
                    } else {
                        var tile = map.tiles[x][y]
                        ret[x][y] = tile.solid ? 1 : 0
                    } 
                }
            }

            return ret
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

        getInitObject() {
            return initter(that, conf)
        },

        async save() {
            var zel = that.zelazny
            delete that.zelazny
            var eng = JSON.parse(JSON.stringify(that))
            that["zelazny"] = zel
            currentScene = eng.scenes.current
            
            var terrain = eng.world.terrainMap
            delete eng.world.terrainMap
            delete eng.display
            delete eng.scenes
            delete eng.map
            delete eng.lights
            delete eng.director
            eng["curScene"] = currentScene
            eng["zelState"] = zel.state

            eng.maps = extractDeltaObject(backupMaps, eng.maps)

            await ipcRenderer.invoke("save", JSON.stringify(eng))
            await ipcRenderer.invoke("saveTerrain", JSON.stringify(terrain))
            
            that.log("Game saved.")
        },
        async load() {
            var json = await ipcRenderer.invoke("load", JSON.stringify(that))
            var terrainJson = await ipcRenderer.invoke("loadTerrain", JSON.stringify(that))
            var loaded = JSON.parse(json)
            
            var zs = loaded.zelState
            delete loaded.zelState

            that.world.cities = []
            applyObjectTo(that, loaded)

            var cs = that.curScene
            that.scenes.set(cs)
            delete that.curScene

            applyObjectTo(that.zelazny.state, zs)

            that.world.terrainMap = JSON.parse(terrainJson)

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
            var pX, pY

            var map = null

            switch(that.renderer.mode) {
                case renderModes.localMap:
                    pX = that.player.x
                    pY = that.player.y
                    map = that.map

                    if(map && map.tickHandler) map.tickHandler()
                    
                    if(that.player.lightOn) {
                        that.player.lightFuel -= 1
                        if(that.player.lightFuel == 0) {
                            that.player.lightOn = false
                            that.log("Your lantern sputters and begins to die as it runs out of fuel.")
                        }
                    }
                    break
                
                case renderModes.worldMap:
                    pX = Math.round(that.renderer.worldMap.x)
                    pY = Math.round(that.renderer.worldMap.y)
                    map = that.world.terrainMap
                    break
            }

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
                    let tile = that.renderer.getTileAt(x + offsetX, y + offsetY, displayWidth, displayHeight, offsetX, offsetY) 
                    if(!tile) continue
                    var c = tile.char
                
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