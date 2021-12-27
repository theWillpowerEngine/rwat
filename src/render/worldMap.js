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
        getTile(x, y) {
            let world = engine.world
            let map = world.terrainMap

            var terrainHeight = map[x][y]
            return terrainTiles[terrainHeight + 5]

        }
    }

    return that
}