const state = require("../crew/enums/state")
const rpg = require("../system")

module.exports = (eng) => {
    let engine = eng
    let ship = engine.ship
    let player = engine.player

    var that = {
        pathingMap: {
            cargoDeck: {
                crewDeck: [{x: 1, y: 58}, {x: 18, y:2}]
            },
            crewDeck: {
                engineRoom: [{x: 4, y: 55}],
                cargoDeck: [{x: 1, y: 62}, {x: 19, y: 2}],
                officerDeck: [{x: 21, y: 53}]
            },
            engineRoom: {
                crewDeck: [{x: 1, y: 0}]
            },
            officerDeck: {
                topDeck: [{x: 20, y: 0, toWheelhouse: false, toTopDeck: true},
                          {x: 20, y: 18, toWheelhouse: true, toTopDeck: false}],
                crewDeck: [{x: 21, y: 18}]
            },
            topDeck: {
                officerDeck: [{x: 60, y: 62, fromWheelhouse: false, fromTopDeck: true},
                              {x: 60, y: 82, fromWheelhouse: true, fromTopDeck: false}]
            }
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
                            crew.state = state.idle
                        } else {
                            var nextPt = crew.path.shift()
                            crew.move(nextPt[0] - crew.x, nextPt[1] - crew.y)
                        }
                        break

                    default:
                        throw "Unknown crew state: " + crew.state
                }
            }


        },
    }

    return that
}