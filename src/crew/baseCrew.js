const colors = require("../map/colors")
const nameGen = require("../world/gens/crewNameGen")
const PF = require('pathfinding')
const states = require("./enums/state")
const actions = require("./actions")

const baseCrew = {
    name: "Placeholder McGee",
    firstName: "Placeholder",
    lastName: "McGee",
    char: "B",
    color: colors.shipUniform,
    deck: "cargoDeck",
    type: null,
    actionQueue: [],
    state: states.idle,
    stateDuration: 0,
    x: 15,
    y: 15
}

module.exports = (eng, o) => {
    let engine = eng
    let ship = engine.ship
    let player = engine.player

    let name = nameGen.getName(engine) 
    var that = {
        ...baseCrew,
        
        name: name.name,
        firstName: name.first,
        lastName: name.last,

        ...o,

        actions: null,

        allOrders() {
            return {
                ...that.globalOrders(),
                ...that.specialOrders()
            }
        },
        globalOrders() {
            return {
                atEase: {
                    description: "At ease",
                    preferredKey: 19,
                    act(engine, cr) { 
                        cr.state = states.idle
                        engine.log(`You say, "At ease, mister ${cr.lastName}."`)
                        return true
                     }
                },
                attention: {
                    description: "Attention",
                    preferredKey: 18,
                    act(engine, cr) { 
                        cr.state = states.holdPosition
                        cr.stateDuration = 20 + (player.leadership * 10)
                        engine.log(`You say, "Hold there, mister ${cr.lastName}."`)
                        return true
                    }
                },
                goToDeck: {
                    description: "Go to Deck...",
                    preferredKey: 9,
                    act() { 
                        commandMenu.choose(["Cargo Deck", "Crew Deck", "Engine Room", "Officer's Deck", "Top Deck"], (e, c, ch) => {
                            let chosenDeck = null
                            switch(ch) {
                                case "Cargo Deck":
                                    chosenDeck = 'cargoDeck'
                                    break
                                case "Crew Deck":
                                    chosenDeck = 'crewDeck'
                                    break
                                case "Engine Room":
                                    chosenDeck = 'engineRoom'
                                    break
                                case "Officer's Deck":
                                    chosenDeck = 'officerDeck'
                                    break
                                case "Top Deck":
                                    chosenDeck = 'topDeck'
                                    break
                            }

                            if(that.deck == chosenDeck)
                                return true

                            var path = engine.director.findDeckPath(that.deck, chosenDeck)
                            
                            let pt = path.shift()
                            that.path = that.getPath(pt.path[0].x, pt.path[0].y)  //TODO:  find the closest not just the first
                            that.state = states.pathing

                            var door = engine.detector.findAdjacent(that.deck, that.path[that.path.length-1][0], that.path[that.path.length-1][1], t => {
                                return (t.char == '*' && t.destMap == pt.deck)
                            })
                            if(!door) throw "Could not find door where expected: " + JSON.stringify(pt)

                            that.actionQueue.push(that.actions.moveToDeck(door.destMap, door.destX, door.destY))
                            var deck = door.destMap
                            for(var pathxel of path) {
                                var nextPath = that.getPath(pathxel.path[0].x, pathxel.path[0].y)  //TODO:  find the closest not just the first
                                if(!nextPath.length) break
                                that.actionQueue.push(that.actions.path(nextPath))

                                var nextDoor = engine.detector.findAdjacent(deck, nextPath[nextPath.length-1][0], nextPath[nextPath.length-1][1],t => {
                                    return (t.char == '*' && t.destMap == pathxel.deck)
                                })
                                if(!nextDoor) throw "Could not find door where expected (on path): " + JSON.stringify(pathxel)

                                that.actionQueue.push(that.actions.moveToDeck(nextDoor.destMap, nextDoor.destX, nextDoor.destY))
                                deck = nextDoor.destMap
                            }

                            e.log(ch)
                            return true
                        })
                        return false
                    }

                },
            }
        },
        specialOrders() {
            return {
                
            }
        },

        path: null,
        getPath(x, y, deck) {
            var matrix = engine.getPathfindingMap(engine.maps[deck ? deck : that.deck])
            var grid = new PF.Grid(matrix)
            var finder = new PF.AStarFinder({
                diagonalMovement: PF.DiagonalMovement.Always
            })
            var path = finder.findPath(that.x, that.y, x, y, grid)
            return path
        },
        pathfind(x, y) {
            that.path = that.getPath(x, y)
            if(that.path && that.path.length) {
                that.state = states.pathing
                return true
            }
            return false
        },
        crossDeckPathfind(deck, x, y) {

        },

        move(dX, dY, map) {
            if(Math.abs(dX) > 1 || Math.abs(dY) > 1)
                return
            
            var nX = that.x + dX,
                nY = that.y + dY

            var bc = engine.boundsCheck(nX, nY, map) 
            if(!bc.ib)
                return

            that.x = nX
            that.y = nY
        },
    }

    if(!o || !o.char) {
        if(eng.crew.find(c => c.char == name.last[0]))
            that.char = name.first[0]
        else
            that.char = name.last[0]
    }
 
    that.actions = actions(engine, that)
    return that
}