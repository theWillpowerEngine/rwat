const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")
const colors = require("../../map/colors.js")

const displayVals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'M', 'A', 'B', 'C', 'D', 'E', 'F']
function colorForDisplayVal(val) {
    if(val > 13)
        return 'red'
    else if (val > 11)
        return 'orange'
    else if (val > 9)
        return 'yellow'
    else if (val > 7)
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

            //Gauges and Displays
            theMap.addDisplay(0, 18, "Internal Pressure Gauge", (eng, tile) => {
                var val = eng.ship.reactor.internalPressure || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })
            theMap.addDisplay(1, 19, "Internal Temperature Gauge", (eng, tile) => {
                var val = eng.ship.reactor.internalTemp || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })
            
            theMap.addDisplay(3, 19, "Reactivity +/- Indicator", (eng, tile) => {
                var old = eng.ship.reactor.info.previousThaums,
                    cur = eng.ship.reactor.internalThaums

                if(old < cur)
                    return '+'
                if(old > cur)
                    return '-'
                return '='
            }, {color: colors.white})
            theMap.addDisplay(4, 19, "Reactivity Amount Indicator", (eng, tile) => {
                var old = eng.ship.reactor.info.previousThaums,
                    cur = eng.ship.reactor.internalThaums                
                var val = Math.abs(old - cur)

                if(val == 0)
                    return '='
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            }, {color: colors.white})

            //Coolant Valve and SCRAM
            theMap.addSwitch(1, 17, "Coolant Flow Control", (eng, tile) => {    
                engine.ship.reactor.coolantGravityPump = true  
                engine.log("You turn main coolant flow on.")
            }, 
            (eng, tile) => { 
                engine.ship.reactor.coolantGravityPump = false
                engine.log("You turn main coolant flow off.")  
            })
            theMap.addButton(1, 16, "Reactor SCRAM button", (eng, tile) => {
                for(var i in eng.ship.reactor.control)
                    eng.ship.reactor.control[i].position = 10
            }, {
                color: 'red'
            })
            
            //Control Rods
            theMap.addValve(5, 18, "Control Rod #1", 1, 10, eng.ship.reactor.control[0].position, (tile) => {
                eng.ship.reactor.control[0].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[0].position
                    return displayVals[val]
                }
            })
            theMap.addValve(4, 18, "Control Rod #2", 1, 10, eng.ship.reactor.control[1].position, (tile) => {
                eng.ship.reactor.control[1].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[1].position
                    return displayVals[val]
                }
            })
            theMap.addValve(3, 18, "Control Rod #3", 1, 10, eng.ship.reactor.control[2].position, (tile) => {
                eng.ship.reactor.control[2].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[2].position
                    return displayVals[val]
                }
            })
            theMap.addValve(2, 18, "Control Rod #4", 1, 10, eng.ship.reactor.control[3].position, (tile) => {
                eng.ship.reactor.control[3].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[3].position
                    return displayVals[val]
                }
            })

            //Other controls
            theMap.addValve(6, 17, "Turbine Output Setting", 0, 3, eng.ship.reactor.turbineSetting, (tile) => {
                eng.ship.reactor.turbineSetting = tile.val
            }, {
                color: "cyan",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.turbineSetting
                    return displayVals[val]
                }
            })
            theMap.addValve(6, 16, "Boiler Temperature Setting", 0, 3, eng.ship.reactor.boilerSetting, (tile) => {
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