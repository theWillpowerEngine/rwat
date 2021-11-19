const makeReactor = require("./sim/reactor.js")
const colors = require("../map/colors.js")
const Color = require('color')

module.exports = (eng) => {
    let engine = eng

    let ambientDark = engine.lights.create(colors.background, 0.75, 0.3)
    let ambient1 = engine.lights.create(colors.lantern, 0.1, 0.3)
    let ambient2 = engine.lights.create(colors.lantern, 0.25, 0.3)
    let ambient3 = engine.lights.create(Color(colors.lantern).mix(Color(colors.white), 0.4).hex(), 0.5, 0.3)

    var that = {
        thaumaticCapacitorThaums: 0,
        reactor: null,

        pilotLights: false, 
        masterLights: 0,
        lightFuel: 10000,
        getMasterAmbientLight() {
            if(!that.masterLights || !that.lightFuel || !that.pilotLights)
                return ambientDark
            
            switch(that.masterLights) {
                case 0:
                    return ambientDark
                case 1:
                    return ambient1
                case 2:
                    return ambient2
                case 3:
                    return ambient3
                default:
                    throw "Invalid master lights setting: " + that.masterLights
            }
        },

        tick() {
            if(that.masterLights > 0 && that.pilotLights) {
                that.lightFuel -= that.masterLights
                if(that.lightFuel < 0)
                    that.lightFuel = 0
            }
            that.reactor.cycle()
        }
    }

    that.reactor = makeReactor(engine, that)
    return that
}