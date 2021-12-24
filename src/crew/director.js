const state = require("./enums/state")

module.exports = (eng) => {
    let engine = eng
    let ship = engine.ship
    let player = engine.player
    let map = engine.map

    var that = {
        tick() {
            for(var crew of engine.crew) {
                switch(crew.state) {
                    case state.idle:
                        
                        break

                    default:
                        throw "Unknown crew state: " + crew.state
                }
            }


        },
    }

    return that
}