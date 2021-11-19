const makeReactor = require("./sim/reactor.js")

module.exports = (eng) => {
    let engine = eng
    var that = {
        thaumaticCapacitorThaums: 0,

        reactor: null,

        tick() {
            that.reactor.cycle()
        }
    }

    that.reactor = makeReactor(engine, that)
    return that
}