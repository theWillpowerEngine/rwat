const state = require("../crew/enums/state")
const rpg = require("../system")

module.exports = (eng) => {
    let engine = eng
    let ship = engine.ship
    let player = engine.player

    var that = {
        pathingMap: {
            cargoDeck: {
                crewDeck: [{x: 1, y: 57}, {x: 17, y:2}],
                engineRoom: "crewDeck",
                officerDeck: "crewDeck",
                topDeck: "crewDeck"
            },
            crewDeck: {
                engineRoom: [{x: 4, y: 54}],
                cargoDeck: [{x: 1, y: 63}, {x: 19, y: 1}],
                officerDeck: [{x: 21, y: 54}],
                topDeck: "officerDeck"
            },
            engineRoom: {
                crewDeck: [{x: 1, y: 1}],
                officerDeck: "crewDeck",
                topDeck: "crewDeck",
                cargoDeck: "crewDeck"
            },
            officerDeck: {
                topDeck: [{x: 20, y: 1}, {x: 20, y: 17}],
                crewDeck: [{x: 21, y: 17}],
                cargoDeck: "crewDeck",
                engineRoom: "crewDeck"
            },
            topDeck: {
                officerDeck: [{x: 60, y: 61}, {x: 60, y: 83}],
                crewDeck: "officerDeck",
                cargoDeck: "officerDeck",
                engineRoom: "officerDeck"
            }
        },

        findDeckPath(startDeck, endDeck) {
            var path = []
            var cur = that.pathingMap[startDeck]
            while(typeof cur[endDeck] == "string") {
                var next = cur[cur[endDeck]]
                if(!next)
                    throw "Fail on: " + cur
                else
                    path.push({path: next, deck: cur[endDeck]}) 
                
                cur = that.pathingMap[cur[endDeck]]
            }
            path.push({path: [...cur[endDeck]], deck: endDeck})
            return path
        },

        tick() {
            for(var crew of engine.crew) {
                let map = engine.maps[crew.deck]
                let sameMapAsPC = true
                if(crew.deck != engine.map.deckName) {
                    sameMapAsPC = false
                }

                switch(crew.state) {
                    case state.idle:
                        let dX = rpg.roll(3) - 2
                        let dY = rpg.roll(3) - 2
                        crew.move(dX, dY, map)                 
                        break

                    case state.pathing:
                        if(!crew.path || !crew.path.length) {
                            crew.actions.next()
                        } else {
                            var nextPt = crew.path.shift()
                            crew.move(nextPt[0] - crew.x, nextPt[1] - crew.y)
                        }
                        break

                    case state.holdPosition:
                        crew.stateDuration -= 1
                        if(crew.stateDuration == 0)
                            crew.actions.next()
                        break

                    default:
                        throw "Unknown crew state: " + crew.state
                }
            }


        },
    }

    return that
}