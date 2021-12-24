const state = require("./enums/state")
const rpg = require("../system")

module.exports = (eng) => {
    let engine = eng
    let ship = engine.ship
    let player = engine.player

    var that = {
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

                    default:
                        throw "Unknown crew state: " + crew.state
                }
            }


        },
    }

    return that
}