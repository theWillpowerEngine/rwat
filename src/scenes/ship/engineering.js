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
            theMap.addSwitch(8, 16, "Coolant Flow Control", (eng, tile) => {    
                engine.ship.reactor.coolantGravityPump = true  
                engine.log("You turn main coolant flow on.")
            }, 
            (eng, tile) => { 
                engine.ship.reactor.coolantGravityPump = false
                engine.log("You turn main coolant flow off.")  
            })
            
            //Control Rods
            theMap.addValve(12, 17, "Control Rod #1", 1, 10, eng.ship.reactor.control[0].position, (tile) => {
                eng.ship.reactor.control[0].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[0].position
                    return displayVals[val]
                }
            })
            theMap.addValve(11, 17, "Control Rod #2", 1, 10, eng.ship.reactor.control[1].position, (tile) => {
                eng.ship.reactor.control[1].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[1].position
                    return displayVals[val]
                }
            })
            theMap.addValve(10, 17, "Control Rod #3", 1, 10, eng.ship.reactor.control[2].position, (tile) => {
                eng.ship.reactor.control[2].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[2].position
                    return displayVals[val]
                }
            })
            theMap.addValve(9, 17, "Control Rod #4", 1, 10, eng.ship.reactor.control[3].position, (tile) => {
                eng.ship.reactor.control[3].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[3].position
                    return displayVals[val]
                }
            })

            //Other controls
            theMap.addValve(13, 16, "Turbine Output Setting", 1, 5, eng.ship.reactor.turbineSetting, (tile) => {
                eng.ship.reactor.turbineSetting = tile.val
            }, {
                color: "cyan",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.turbineSetting
                    return displayVals[val]
                }
            })
            theMap.addValve(13, 15, "Boiler Temperature Setting", 1, 5, eng.ship.reactor.boilerSetting, (tile) => {
                eng.ship.reactor.boilerSetting = tile.val
            }, {
                color: "cyan",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.boilerSetting
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