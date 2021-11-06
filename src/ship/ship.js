const makeReactor = require("./sim/reactor.js")

module.exports = (eng) => {
    let engine = eng
    var that = {
        reactor: null,

        tick() {
            var reactorOutputs = that.reactor.cycle()
            console.log(reactorOutputs)
            console.log(that.reactor)
            console.log("--------------------------------")
        }
    }

    that.reactor = makeReactor(engine, that)
    return that
}