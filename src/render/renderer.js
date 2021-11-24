const Color = require('color')
const makeLights = require('./lights.js')
const colors = require("../map/colors.js")

module.exports = (eng) => {
    let engine = eng
    engine.lights = makeLights(eng)
    var that = {
        invisibleTileScaleFactor: 0.85,
        ambientLightScaleFactor: 0.5,
        playerLightSource() { return engine.lights.create(engine.player.tile.bg, 0.9, 3, -0.21) },

        getTileAt(x, y) {
            if(x == engine.player.x && y == engine.player.y) {
                if(engine.player.lightOn)
                    return engine.player.tile
                else
                    return {
                        ...engine.player.tile,
                        bg: null
                    }
            }   
            
            var tile = null
            try {
                var tile = { x, y, ...engine.map.tiles[x][y] }
            } catch(e) {
                return null
            }

            if(typeof tile.char === 'function')
                tile.char = tile.char(engine, tile)

            //Check visibility
            if(!engine.extendedCheckLOS(x, y)) {
                let adjustedColor = Color(tile.color).darken(that.invisibleTileScaleFactor).hex()
                tile.color = adjustedColor
            } else {
                //If the tile is visible (or at least, within los), apply lighting
                var light = engine.lights.getLightAt(x, y)

                if(light.ambient) {
                    let adjustedColor = Color(tile.color).mix(Color(light.color), light.intensity).darken(that.ambientLightScaleFactor - (that.ambientLightScaleFactor * light.range)).hex()
                    tile.color = adjustedColor
                } else if(!light.intensity) {
                    let adjustedColor = Color(tile.color).darken(that.invisibleTileScaleFactor).hex()
                    tile.color = adjustedColor
                } else {
                    //we have light to apply
                    let adjustedColor = Color(tile.color).mix(Color(light.color), light.intensity).hex()
                    tile.color = adjustedColor
                    if(light.intensity >= 0.3 && !tile.noBgLightTint)
                    {
                        adjustedColor = tile.bg || colors.background
                        adjustedColor = Color(adjustedColor).mix(Color(light.color), light.intensity/3).hex()
                        tile.bg = adjustedColor
                    }
                }
            }
           
            return tile
        }
    }

    return that
}