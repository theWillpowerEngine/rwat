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
            engine.maps["engineRoom"] = map.blank(20, 10)
            let theMap = engine.maps.engineRoom
            
            //#region Rough-In (walls/floor/doors/etc.)
            theMap.fill(tiles.shipFloor)
            theMap.vline(tiles.shipWall, 0, 0, 10)
            theMap.vline(tiles.shipWall, 19, 0, 10)

            theMap.hline(tiles.shipWall, 0, 0, 20)
            theMap.hline(tiles.shipWall, 0, 9, 20)

            theMap.vline(tiles.shipWall, 7, 5, 4)

            //Clean up some LOS
            theMap.apply(1, 9, { transparent: true, background: 'white' }, 5)

            //Doors
            theMap.door(1, 0, "the door out of the engine room", "dev", 6, 7, "You go to the other place")

            //Misc Map pieces (pipes/etc.)
            theMap.addDisplay(1, 8, "a coolant pipe", (eng, tile) => {
                if(eng.ship.reactor.coolantPressure || eng.ship.reactor.coolantGravityPump)
                    tile.color = colors.blue
                else
                    tile.color = colors.grey
                return 'o'
            }, {color: colors.grey, transparent: true })
            theMap.vline(tiles.shipWall, 6, 8, 1, {transparent: true})
            ////////////////////////////////////////
            //#endregion

            //#region Gauges and Displays
            theMap.addDisplay(7, 5, "", (eng, tile) => {
                return '|'
            }, {
                transparent: true, 
                desc: (eng, t) => {
                    if(eng.player.distToDirect(t.x, t.y) > 3)
                        return "That's the thaumatic capacitor charge gauge."
                    return (`The display indicates that the capacitor is ${Math.round(eng.ship.thaumaticCapacitorThaums / 10)}% charged.`)
                }
            })
            theMap.addDisplay(7, 7, "", (eng, tile) => {
                return '|'
            }, {
                transparent: true, 
                desc: (eng, t) => {
                    if(eng.player.distToDirect(t.x, t.y) > 3)
                        return "That's the heat transfer status panel."
                    return (`The heat transfer is set to ${lowMedMax(eng.ship.reactor.boilerSetting)}, the current effectiveness is: ${lowMedMax(eng.ship.reactor.boilerHeat)}.`)
                }
            })
            theMap.addDisplay(7, 6, "", (eng, tile) => {
                return '|'
            }, {
                transparent: true, 
                desc: (eng, t) => {
                    debugger
                    if(eng.player.distToDirect(t.x, t.y) > 3)
                        return "That's the turbine shaft status panel."
                    return (`The desired shaft speed is ${lowMedMax(eng.ship.reactor.turbineSetting)}, current speed is: ${lowMedMax(eng.ship.reactor.turbineForce)}.`)
                }
            })

            theMap.addDisplay(0, 8, "the reactor's internal pressure gauge", (eng, tile) => {
                if(eng.ship.reactor.breach) {
                    tile.color = colors.red
                    return 'X'
                }
                
                var val = eng.ship.reactor.internalPressure || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'U'
            })
            theMap.addDisplay(1, 9, "the reactor's internal temperature gauge", (eng, tile) => {
                var val = eng.ship.reactor.internalTemp || 0
                tile.color = colorForDisplayVal(val)
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })
            
            theMap.addDisplay(3, 9, "the reactivity +/- indicator", (eng, tile) => {
                var old = eng.ship.reactor.info.previousThaums,
                    cur = eng.ship.reactor.internalThaums

                if(old < cur)
                    return '+'
                if(old > cur)
                    return '-'
                return '='
            }, {color: colors.white})
            theMap.addDisplay(4, 9, "the reactivity amount indicator", (eng, tile) => {
                var old = eng.ship.reactor.info.previousThaums,
                    cur = eng.ship.reactor.internalThaums                
                var val = Math.abs(old - cur)

                if(val == 0)
                    return '='
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            }, {color: colors.white})

            theMap.addDisplay(4, 0, "the input shaft speed indicator", (eng, tile) => {
                var val = eng.ship.reactor.turbineForce || 0
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            }, { color: colors.white })
            theMap.addDisplay(5, 0, "the transmission speed indicator", (eng, tile) => {
                var val = eng.ship.drive.transmissionSpeed || 0
                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            }, { color: colors.white })
            theMap.addDisplay(6, 0, "the prop speed indicator (blue = reverse, green = ahead)", (eng, tile) => {
                var val = Math.abs(eng.ship.drive.propSpeed || 0)
                if(eng.ship.drive.propSpeed > 0)
                    tile.color = colors.green
                else if(eng.ship.drive.propSpeed < 0)
                    tile.color = colors.blue
                else
                    tile.color = colors.white

                if(displayVals.length > val)
                    return displayVals[val]
                return 'X'
            })
            ////////////////////////////////////////
            //#endregion

            //#region Reactor Controls

            //Coolant Valve and SCRAM
            theMap.addSwitch(1, 7, "the coolant boost pump control switch", (eng, tile) => {    
                engine.ship.reactor.coolantGravityPump = true  
                engine.log("You turn the coolant gravity pump on.")
            }, 
            (eng, tile) => { 
                engine.ship.reactor.coolantGravityPump = false
                engine.log("You turn main coolant boost pump off.")  
            })
            theMap.addButton(1, 6, "the reactor SCRAM button", (eng, tile) => {
                for(var i in eng.ship.reactor.control)
                    eng.ship.reactor.control[i].position = 10
                eng.log("You scramble the reactor")
            }, {
                color: colors.red
            })
            
            //Control Rods
            theMap.addValve(5, 8, "the #1 rod controller", 1, 10, eng.ship.reactor.control[0].position, (tile) => {
                eng.ship.reactor.control[0].position = tile.val
            }, {
                color: colors.gold,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[0].position
                    return displayVals[val]
                }
            })
            theMap.addValve(4, 8, "the #2 rod controller", 1, 10, eng.ship.reactor.control[1].position, (tile) => {
                eng.ship.reactor.control[1].position = tile.val
            }, {
                color: colors.gold,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[1].position
                    return displayVals[val]
                }
            })
            theMap.addValve(3, 8, "the #3 rod controller", 1, 10, eng.ship.reactor.control[2].position, (tile) => {
                eng.ship.reactor.control[2].position = tile.val
            }, {
                color: colors.gold,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[2].position
                    return displayVals[val]
                }
            })
            theMap.addValve(2, 8, "the #4 rod controller", 1, 10, eng.ship.reactor.control[3].position, (tile) => {
                eng.ship.reactor.control[3].position = tile.val
            }, {
                color: colors.gold,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.control[3].position
                    return displayVals[val]
                }
            })

            //Other controls
            theMap.addValve(6, 6, "the shaft turbine speed setting", 0, 3, eng.ship.reactor.turbineSetting, (tile) => {
                eng.ship.reactor.turbineSetting = tile.val
            }, {
                color: colors.silver,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.turbineSetting
                    return displayVals[val]
                }
            })
            theMap.addValve(6, 7, "the boiler temperature setting", 0, 3, eng.ship.reactor.boilerSetting, (tile) => {
                eng.ship.reactor.boilerSetting = tile.val
            }, {
                color: colors.silver,
                char: (eng, tile) => {
                    var val = eng.ship.reactor.boilerSetting
                    return displayVals[val]
                }
            })

            theMap.addSwitch(6, 5, "the thaumatic capacitor charge switch", (eng, tile) => {    
                engine.ship.reactor.capacitorCharge = true  
                engine.log("You set the thaumatic capacitor to charge.")
            }, 
            (eng, tile) => { 
                engine.ship.reactor.capacitorCharge = false
                engine.log("You disable charging to the thaumatic capacitor.")  
            })
            ////////////////////////////////////////
            //#endregion

            //#region Drive Controls
            let didLubricate = false
            theMap.addValve(4, 1, "the engine transmission manual lubrication spinner", 0, 9, 0, (tile) => {
                didLubricate = true
                if(eng.ship.drive.lubrication < 10)
                    eng.ship.drive.lubrication += 1
            }, {
                color: colors.silver
            })
            let lubeHandle = theMap.tiles[4][1] 

            theMap.addSwitch(4, 2, "the engine's main clutch switch", (eng, tile) => {    
                eng.ship.drive.clutch = true
                eng.log("You engage the engine's main clutch.")
            }, 
            (eng, tile) => { 
                eng.ship.drive.clutch = false
                eng.log("You disengage the engine's main clutch.")
            }, { state: true })

            theMap.draw(tiles.shipWall, 6, 1, { transparent: true })
            theMap.addSwitch(6, 2, "the propeller/shaft connection switch", (eng, tile) => {    
                eng.ship.drive.propConnect = true
                eng.log("You connect the propeller to the shaft.")
            }, 
            (eng, tile) => { 
                eng.ship.drive.propConnect = false
                eng.log("You disconnect the propeller from the shaft.")
            }, { state: true })

            theMap.addValve(5, 1, "the engine's transmission gear lever", 0, 3, eng.ship.drive.transmission, (tile) => {
                eng.ship.drive.transmission = tile.val
            }, {
                color: colors.gold
            })

            /////////////////////////////
            //#endregion

            //#region Misc Controls (Lights/etc.)

            theMap.addSwitch(0, 1, "the lever to activate the pilot lights for the shipboard lighting system", (eng, tile) => {    
                if(!engine.ship.pilotLights) {
                    engine.ship.pilotLights = true
                    engine.log("With notable effort you pull the heavy lever, starting the pilot lights throughout the ship.  After a few moments the lever begins to return to it's original position.")
                } else {
                    engine.log("The lever pulls down easily without resistance then returns to it's origina position.")
                }
                tile.state = false
            }, 
            (eng, tile) => { 
                throw "This should never happen"  
            })

            theMap.addValve(0, 2, "the master lights setting", 0, 3, eng.ship.masterLights, (tile) => {
                eng.ship.masterLights = tile.val
            }, {
                color: colors.silver,
                char: (eng, tile) => {
                    var val = eng.ship.masterLights
                    return displayVals[val]
                }
            })
            ////////////////////////////////////////
            //#endregion

            //On Tick handler
            theMap.tickHandler = () => {
                if(!didLubricate && lubeHandle.val > 0)
                    lubeHandle.val -= 1
                didLubricate = false
            
                //Light Sources
                engine.lights.setAmbient(engine.ship.getMasterAmbientLight())
            
                var l = engine.lights.get("breach")
                if(l) {
                    if(engine.ship.reactor.breach) {
                        l.intensity = 1.0
                        l.range = 2
                        l.fo = -0.4
                    } else {
                        l.intensity = l.range = l.fo = 0
                    }
                }
            }
        },
        applyLights() {
            //engine.lights.setAmbient(engine.ship.getMasterAmbientLight())

            engine.lights.add(0, 8, colors.red, 0, 0, 0, "breach")
         },
    }

    return that
}