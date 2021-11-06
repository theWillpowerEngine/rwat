const colors = require("./map/colors.js")
const makeRenderer = require("./render/renderer.js")
const makePlayer = require("./player/player.js")
const makeShip = require("./ship/ship.js")
const makeScenes = require("./scenes/scenes.js")
const registerKeys = require("./keys.js")
const Color = require('color')

module.exports = (logger, opts) => {
    var conf = {
        defaultScene: "dev",

        ...opts
    }

    var that = {
        maps: {

        },
        map: null,
        scenes: null,

        display: null,
        lights: null,
        renderer: null,
        
        logText: '',
        log(msg) {
            console.log(msg)
            that.logText += (msg || '') + "<br />"
        },

        player: null,
        ship: null,

        checkLOS(x, y, x1, y1) {
            if(!x1) x1 = that.player.x
            if(!y1) y1 = that.player.y
            var pts = that.map.getPointsBetween(x, y, x1, y1)
            for(var pt of pts) {
                if(pt[0] == that.player.x && pt[1] == that.player.y)
                    return false

                var tile = that.map.tiles[pt[0]][pt[1]] 
                if(tile.solid && !tile.transparent)
                    return false
            }
            return true
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
            pg(2, "Preinitialization complete")

            var sceneCount = that.scenes.loadAll()
            that.scenes.set(conf.defaultScene)
            pg(5, `Loaded ${sceneCount} scenes`)

            registerKeys(that)
            pg(50, "Set initial game state")

            pg(99, "Initialization done, installing into UI")
            that.display = new ROT.Display({
                width:140,
                height:60,
                fontSize: 20,
                fontStyle: "bold",
                bg: colors.background,
                forceSquareRatio: true
            });
            document.getElementById("game").appendChild(that.display.getContainer()); 

            pg(100, "Initialization complete!")
            return conf
        },

        render() {
            that.ship.tick()
            
            var map = that.map
            for(var x=0; x<map.width; x++)
                for(var y=0; y<map.height; y++) {
                    let tile = that.renderer.getTileAt(x, y) 
                    if(!tile) continue
                    var c = tile.char
                    if(typeof c === 'function')
                        c = c(that, tile)
                    that.display.draw(x, y, c, tile.color, tile.bg)
                }

            logger(that.logText)
            that.logText = ''
        }
    }

    return that
}