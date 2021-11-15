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

            //Misc Map pieces (pipes/etc.)
            theMap.addDisplay(1, 18, "a coolant pipe", (eng, tile) => {
                if(eng.ship.reactor.coolantPressure || eng.ship.reactor.coolantGravityPump)
                    tile.color = 'blue'
                else
                    tile.color = 'grey'
                return 'o'
            }, {color: 'grey'})

            //Glowing Indicators
            

            //Gauges and Displays
            theMap.addDisplay(0, 18, "the Internal Pressure Gauge", (eng, tile) => {
                var val = eng.ship.reactor.internalPressure || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })
            theMap.addDisplay(1, 19, "the Internal Temperature Gauge", (eng, tile) => {
                var val = eng.ship.reactor.internalTemp || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })
            
            theMap.addDisplay(3, 19, "the Reactivity +/- Indicator", (eng, tile) => {
                var old = eng.ship.reactor.info.previousThaums,
                    cur = eng.ship.reactor.internalThaums

                if(old < cur)
                    return '+'
                if(old > cur)
                    return '-'
                return '='
            }, {color: colors.white})
            theMap.addDisplay(4, 19, "the Reactivity Amount Indicator", (eng, tile) => {
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
            theMap.addSwitch(1, 17, "the Coolant Boost Pump control switch", (eng, tile) => {    
                engine.ship.reactor.coolantGravityPump = true  
                engine.log("You turn the coolant gravity pump on.")
            }, 
            (eng, tile) => { 
                engine.ship.reactor.coolantGravityPump = false
                engine.log("You turn main coolant boost pump off.")  
            })
            theMap.addButton(1, 16, "the Reactor SCRAM button", (eng, tile) => {
                for(var i in eng.ship.reactor.control)
                    eng.ship.reactor.control[i].position = 10
            }, {
                color: 'red'
            })
            
            //Control Rods
            theMap.addValve(5, 18, "the #1 Rod Controller", 1, 10, eng.ship.reactor.control[0].position, (tile) => {
                eng.ship.reactor.control[0].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[0].position
                    return displayVals[val]
                }
            })
            theMap.addValve(4, 18, "the #2 Rod Controller", 1, 10, eng.ship.reactor.control[1].position, (tile) => {
                eng.ship.reactor.control[1].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[1].position
                    return displayVals[val]
                }
            })
            theMap.addValve(3, 18, "the #3 Rod Controller", 1, 10, eng.ship.reactor.control[2].position, (tile) => {
                eng.ship.reactor.control[2].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[2].position
                    return displayVals[val]
                }
            })
            theMap.addValve(2, 18, "the #4 Rod Controller", 1, 10, eng.ship.reactor.control[3].position, (tile) => {
                eng.ship.reactor.control[3].position = tile.val
            }, {
                color: "green",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[3].position
                    return displayVals[val]
                }
            })

            //Other controls
            theMap.addValve(6, 17, "the Turbine Max setting", 0, 3, eng.ship.reactor.turbineSetting, (tile) => {
                eng.ship.reactor.turbineSetting = tile.val
            }, {
                color: "cyan",
                char: (eng, tile) => {
                    var val = eng.ship.reactor.turbineSetting
                    return displayVals[val]
                }
            })
            theMap.addValve(6, 16, "the Boiler Temperature setting", 0, 3, eng.ship.reactor.boilerSetting, (tile) => {
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