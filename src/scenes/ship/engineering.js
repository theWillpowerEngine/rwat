const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")
const colors = require("../../map/colors.js")

const displayVals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'M', 'A', 'B', 'C', 'D', 'E', 'F']
function colorForDisplayVal(val) {
    if(val > 13)
        return colors.red
    else if (val > 11)
        return colors.orange
    else if (val > 9)
        return colors.orange
    else if (val > 7)
        return colors.blue
    else if (val > 2)
        return colors.green
    else
        return colors.grey
}

function lowMedMax(val) {
    switch(val) {
        case 0:
            return "off"
        case 1:
            return "low"
        case 2:
            return "medium"
        case 3:
            return "max"
        default:
            throw "Invalid lowMedMax call: " + val
    }
}

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            engine.maps["engineering"] = map.blank(20, 10)
            let theMap = engine.maps.engineering
            
            theMap.fill(tiles.shipFloor)
            theMap.vline(tiles.shipWall, 0, 0, 10)
            theMap.vline(tiles.shipWall, 19, 0, 10)

            theMap.hline(tiles.shipWall, 0, 0, 20)
            theMap.hline(tiles.shipWall, 0, 9, 20)

            theMap.vline(tiles.shipWall, 7, 4, 5)

            //Misc Map pieces (pipes/etc.)
            theMap.addDisplay(1, 8, "a coolant pipe", (eng, tile) => {
                if(eng.ship.reactor.coolantPressure || eng.ship.reactor.coolantGravityPump)
                    tile.color = colors.blue
                else
                    tile.color = colors.grey
                return 'o'
            }, {color: colors.grey, transparent: true })
            theMap.vline(tiles.shipWall, 6, 8, 1)

            //Gauges and Displays
            theMap.addDisplay(7, 5, "", (eng, tile) => {
                return '|'
            }, {
                transparent: true, 
                desc: (eng, t) => {
                    if(eng.player.distToDirect(t.x, t.y) > 3)
                        return "That's the Thaumatic Capacitor Charge gauge."
                    return (`The display indicates that the capacitor is ${Math.round(eng.ship.thaumaticCapacitorThaums / 10)}% charged.`)
                }
            })
            theMap.addDisplay(7, 6, "", (eng, tile) => {
                return '|'
            }, {
                transparent: true, 
                desc: (eng, t) => {
                    if(eng.player.distToDirect(t.x, t.y) > 3)
                        return "That's the heat transfer status panel."
                    return (`The heat transfer is set to ${lowMedMax(eng.ship.reactor.boilerSetting)}, the current effectiveness is: ${lowMedMax(eng.ship.reactor.boilerHeat)}.`)
                }
            })
            theMap.addDisplay(7, 7, "", (eng, tile) => {
                return '|'
            }, {
                transparent: true, 
                desc: (eng, t) => {
                    debugger
                    if(eng.player.distToDirect(t.x, t.y) > 3)
                        return "That's the Turbine Shaft status panel."
                    return (`The desired shaft speed is ${lowMedMax(eng.ship.reactor.turbineSetting)}, current speed is: ${lowMedMax(eng.ship.reactor.turbineForce)}.`)
                }
            })

            theMap.addDisplay(0, 8, "the Internal Pressure Gauge", (eng, tile) => {
                var val = eng.ship.reactor.internalPressure || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })
            theMap.addDisplay(1, 9, "the Internal Temperature Gauge", (eng, tile) => {
                var val = eng.ship.reactor.internalTemp || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })
            
            theMap.addDisplay(3, 9, "the Reactivity +/- Indicator", (eng, tile) => {
                var old = eng.ship.reactor.info.previousThaums,
                    cur = eng.ship.reactor.internalThaums

                if(old < cur)
                    return '+'
                if(old > cur)
                    return '-'
                return '='
            }, {color: colors.white})
            theMap.addDisplay(4, 9, "the Reactivity Amount Indicator", (eng, tile) => {
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
            theMap.addSwitch(1, 7, "the Coolant Boost Pump control switch", (eng, tile) => {    
                engine.ship.reactor.coolantGravityPump = true  
                engine.log("You turn the coolant gravity pump on.")
            }, 
            (eng, tile) => { 
                engine.ship.reactor.coolantGravityPump = false
                engine.log("You turn main coolant boost pump off.")  
            })
            theMap.addButton(1, 6, "the Reactor SCRAM button", (eng, tile) => {
                for(var i in eng.ship.reactor.control)
                    eng.ship.reactor.control[i].position = 10
                eng.log("You scramble the reactor")
            }, {
                color: colors.red
            })
            
            //Control Rods
            theMap.addValve(5, 8, "the #1 Rod Controller", 1, 10, eng.ship.reactor.control[0].position, (tile) => {
                eng.ship.reactor.control[0].position = tile.val
            }, {
                color: colors.gold,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[0].position
                    return displayVals[val]
                }
            })
            theMap.addValve(4, 8, "the #2 Rod Controller", 1, 10, eng.ship.reactor.control[1].position, (tile) => {
                eng.ship.reactor.control[1].position = tile.val
            }, {
                color: colors.gold,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[1].position
                    return displayVals[val]
                }
            })
            theMap.addValve(3, 8, "the #3 Rod Controller", 1, 10, eng.ship.reactor.control[2].position, (tile) => {
                eng.ship.reactor.control[2].position = tile.val
            }, {
                color: colors.gold,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[2].position
                    return displayVals[val]
                }
            })
            theMap.addValve(2, 8, "the #4 Rod Controller", 1, 10, eng.ship.reactor.control[3].position, (tile) => {
                eng.ship.reactor.control[3].position = tile.val
            }, {
                color: colors.gold,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[3].position
                    return displayVals[val]
                }
            })

            //Other controls
            theMap.addValve(6, 7, "the Turbine Max setting", 0, 3, eng.ship.reactor.turbineSetting, (tile) => {
                eng.ship.reactor.turbineSetting = tile.val
            }, {
                color: colors.silver,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.turbineSetting
                    return displayVals[val]
                }
            })
            theMap.addValve(6, 6, "the Boiler Temperature setting", 0, 3, eng.ship.reactor.boilerSetting, (tile) => {
                eng.ship.reactor.boilerSetting = tile.val
            }, {
                color: colors.silver,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.boilerSetting
                    return displayVals[val]
                }
            })

            theMap.addSwitch(6, 5, "the Thaumatic Capacitor Charge switch", (eng, tile) => {    
                engine.ship.reactor.capacitorCharge = true  
                engine.log("You set the thaumatic capacitor to charge.")
            }, 
            (eng, tile) => { 
                engine.ship.reactor.capacitorCharge = false
                engine.log("You disable charging to the thaumatic capacitor.")  
            })

        },
        applyLights() {
            engine.lights.setAmbient(engine.lights.create(colors.white, 0.5, 0.5))
         },
    }

    return that
}