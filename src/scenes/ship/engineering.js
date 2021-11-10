const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")
const colors = require("../../map/colors.js")

const displayVals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'M', 'A', 'B', 'C', 'D', 'E,', 'F']
function colorForDisplayVal(val) {
    if(val > 13)
        return 'red'
    else if (val > 10)
        return 'orange'
    else if (val > 8)
        return 'blue'
    else if (val > 2)
        return 'green'
    else
        return colors.white
}

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            engine.maps["engineering"] = map.blank(20, 20)
            let theMap = engine.maps.engineering
            
            theMap.fill(tiles.shipFloor)
            theMap.vline(tiles.shipWall, 0, 0, 20)
            theMap.vline(tiles.shipWall, 19, 0, 20)

            theMap.hline(tiles.shipWall, 0, 0, 20)
            theMap.hline(tiles.shipWall, 0, 19, 20)

            theMap.addDisplay(9, 19, "Pressure Gauge", (eng, tile) => {
                var val = eng.ship.reactor.internalPressure || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })
            theMap.addDisplay(11, 19, "Temperature Gauge", (eng, tile) => {
                var val = eng.ship.reactor.internalTemp || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })

        },
        applyLights() {
            engine.lights.setAmbient(engine.lights.create(colors.lantern, 0.5, 0.5))
         },
    }

    return that
}