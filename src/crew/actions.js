const state = require("./enums/state")

module.exports = (eng, cr) => {
    let engine = eng
    let crew = cr

    let that = {
        next() {
            if(!crew.actionQueue.length) {
                crew.state = state.idle
                return
            }
            
            var next = crew.actionQueue.shift()
            switch(next.type) {
                case "path":
                    crew.pathFind(next.x, next.y)
                    break

                case "deckMove":
                    crew.deck = next.deck
                    crew.x = next.x
                    crew.y = next.y
                    break

                default:
                    throw "Unknown action queue type: " + next.type
            }
        },

        path(pt) {
            var ret = {
                type: "path",
                x: pt.x,
                y: pt.y
            }
            return ret
        },
        moveToDeck(deck, x, y) {
            var ret = {
                type: "deckMove",
                deck,
                x,
                y
            }
            return ret
        }
    }

    return that
}