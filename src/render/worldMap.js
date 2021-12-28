const tiles = require("../map/tiles")
const colors = require("../map/colors")
const Color = require("color")

//#region Terrain Tiles
const terrainTiles = [
    tiles.makeTile({        
        char: "~",
        color: colors.blue,
        bg: colors.background,
        noBgLightTint: true,
        desc: "Very Deep Water"
    }),
    tiles.makeTile({        
        char: "~",
        color: colors.cornwallis,
        bg: colors.background,
        noBgLightTint: true,
        desc: "Very Deep Water"
    }),
    tiles.makeTile({        
        char: "~",
        color: colors.byakuya,
        bg: colors.blue,
        noBgLightTint: true,
        desc: "Deep Water"
    }),
    tiles.makeTile({        
        char: "~",
        color: colors.byakuya,
        bg: colors.cornwallis,
        noBgLightTint: true,
        desc: "Water"
    }),
    tiles.makeTile({        
        char: "~",
        color: colors.byakuya,
        bg: colors.aqua,
        noBgLightTint: true,
        desc: "Shallow Water"
    }),
    tiles.makeTile({        
        char: ".",
        color: colors.khaki,
        bg: colors.background,
        noBgLightTint: true,
        desc: "Low Land"
    }),
    tiles.makeTile({        
        char: "-",
        color: colors.green,
        bg: colors.background,
        isPC: true,
        desc: "Land"
    }),
    tiles.makeTile({        
        char: "=",
        color: colors.green,
        bg: colors.background,
        noBgLightTint: true,
        desc: "Highlands"
    }),
    tiles.makeTile({        
        char: "=",
        color: colors.khaki,
        bg: colors.grey,
        noBgLightTint: true,
        desc: "Cliff"
    }),
    tiles.makeTile({        
        char: "^",
        color: colors.puke,
        bg: colors.khaki,
        noBgLightTint: true,
        desc: "Low Mountain"
    }),
    tiles.makeTile({        
        char: "^",
        color: colors.maroon,
        bg: colors.steel,
        noBgLightTint: true,
        desc: "High Mountain"
    })
]

const cityTile = tiles.makeTile({
    char: "*",
    color: colors.purple,
    bg: colors.lantern,
    noBgLightTint: true,
    desc: "City"
})
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

            var count = 0
            var total = 0

            for(var i=0; i<=that.zoom; i++)
                for(var j=0; j<=that.zoom; j++) {
                    if(x+i < 0 || x+i >= engine.world.width || y+j < 0 || y+j >= engine.world.height) continue
                    else count += 1

                    var city = engine.world.cities.find(c => c.x == x+i && c.y == y+j) 
                    if(city) {
                        return {
                            ...cityTile,
                            char: city.index.toString(),
                            desc: "City of " + city.name
                        }
                    }

                    try {
                        total += map[x+i][y+j]
                    } catch (e) {
                        count -= 1
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