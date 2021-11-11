const makeReactor = require("./sim/reactor.js")

module.exports = (eng) => {
    let engine = eng
    var that = {
        reactor: null,

        tick() {
            that.reactor.cycle()
        }
    }

    that.reactor = makeReactor(engine, that)
    return that
}