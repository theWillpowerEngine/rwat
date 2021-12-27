const tiles = require("../map/tiles")
const colors = require("../map/colors")
const Color = require("color")

//#region Terrain Tiles
const terrainTiles = [
    tiles.makeTile({        
        char: "~",
        color: colors.background,
        bg: colors.cornwallis,
        noBgLightTint: true,
        desc: "Very Deep Water"
    }),
    tiles.makeTile({        
        char: "~",
        color: colors.cornwallis,
        bg: colors.background,
        noBgLightTint: true,
        desc: "Deep Water"
    }),
    tiles.makeTile({        
        char: "~",
        color: colors.blue,
        bg: colors.cornwallis,
        noBgLightTint: true,
        desc: "Water"
    }),
    tiles.makeTile({        
        char: "~",
        color: colors.cyan,
        bg: colors.aqua,
        noBgLightTint: true,
        desc: "Shallow Water"
    }),
    tiles.makeTile({        
        char: ".",
        color: colors.sand,
        bg: colors.background,
        noBgLightTint: true,
        desc: "Coast"
    }),
    tiles.makeTile({        
        char: "=",
        color: colors.brown,
        bg: colors.background,
        isPC: true,
        desc: "Land"
    }),
    tiles.makeTile({        
        char: "=",
        color: colors.green,
        bg: colors.background,
        noBgLightTint: true,
        desc: "Forest / Grasslands"
    }),
    tiles.makeTile({        
        char: "=",
        color: colors.yellow,
        bg: colors.green,
        noBgLightTint: true,
        desc: "Rising Elevation"
    }),
    tiles.makeTile({        
        char: "^",
        color: colors.orange,
        bg: colors.background,
        noBgLightTint: true,
        desc: "Low Mountain"
    }),
    tiles.makeTile({        
        char: "^",
        color: colors.maroon,
        bg: colors.orange,
        noBgLightTint: true,
        desc: "High Mountain"
    })
]
//#endregion

module.exports = (eng) => {
    let engine = eng

    var that = {
        zoom: 1,
        x: 0,
        y: 0,

        getTile(x, y, dW, dH, tlX, tlY) {
            let world = engine.world
            let map = world.terrainMap

            let midX = tlX + Math.floor(dW / 2)
            let midY = tlY + Math.floor(dH / 2)

            let xOffMid = (x - midX) * that.zoom 
            let yOffMid = (y - midY) * that.zoom

            x += xOffMid
            y += yOffMid

            var count = that.zoom * that.zoom
            var total = 0

            for(var i=0; i<that.zoom; i++)
                for(var j=0; j<that.zoom; j++) {
                    if(x+i < 0 || x+i >= engine.world.width || y+j < 0 || y+j >= engine.world.height) {
                        count -= 1
                        continue
                    }

                    try {
                        total += map[x+i][y+j]
                    } catch(e) {
                        console.log(x+i)
                    }
                }    
            
            if(count == 0)
                return tiles.space

            total = Math.round(total / count)
            return terrainTiles[total]

        }
    }

    return that
}