const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")
const colors = require("../../map/colors.js")

const displayVals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'M', 'A', 'B', 'C', 'D', 'E', 'F']
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

            //Coolant Valve
            theMap.addValve(8, 16, "Coolant Flow Valve", 0, 5, eng.ship.reactor.coolantFlow, (tile) => {
                eng.ship.reactor.coolantFlow = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.coolantFlow
                    return displayVals[val]
                }
            })
            
            //Control Rods
            theMap.addValve(12, 17, "Control Rod #1", 1, 10, eng.ship.reactor.rods[0][1].position, (tile) => {
                eng.ship.reactor.rods[0][1].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.rods[0][1].position
                    return displayVals[val]
                }
            })
            theMap.addValve(11, 17, "Control Rod #2", 1, 10, eng.ship.reactor.rods[1][0].position, (tile) => {
                eng.ship.reactor.rods[1][0].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.rods[1][0].position
                    return displayVals[val]
                }
            })
            theMap.addValve(10, 17, "Control Rod #3", 1, 10, eng.ship.reactor.rods[1][2].position, (tile) => {
                eng.ship.reactor.rods[1][2].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.rods[1][2].position
                    return displayVals[val]
                }
            })
            theMap.addValve(9, 17, "Control Rod #4", 1, 10, eng.ship.reactor.rods[2][1].position, (tile) => {
                eng.ship.reactor.rods[2][1].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.rods[2][1].position
                    return displayVals[val]
                }
            })

        },
        applyLights() {
            engine.lights.setAmbient(engine.lights.create(colors.lantern, 0.5, 0.5))
         },
    }

    return that
}