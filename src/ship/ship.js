const makeReactor = require("./sim/reactor.js")
const colors = require("../map/colors.js")
const Color = require('color')
const makeDrive = require("./sim/drive.js")
const makeLift = require("./sim/lift.js")
const mover = require("./sim/mover.js")

module.exports = (eng) => {
    let engine = eng

    let ambientDark = engine.lights.create(colors.background, 0.75, 0.3)
    let ambient1 = engine.lights.create(colors.lantern, 0.1, 0.3)
    let ambient2 = engine.lights.create(colors.lantern, 0.25, 0.3)
    let ambient3 = engine.lights.create(Color(colors.lantern).mix(Color(colors.white), 0.4).hex(), 0.5, 0.3)

    var that = {
        x: 0,
        y: 0,
        z: 0,
        heading: 0,

        tied: {
            x: 0, y: 0, z: 1
        },
        tieLength: 1,
        movementVector: {
            x: 0, y: 0, z: 0
        },

        weight: 20,

        damageModel: require("./damage.js"),
        thaumaticCapacitorThaums: 0,
        reactor: null,
        drive: null,
        lift: null,

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

        drainThaums(amt) {
            if(that.thaumaticCapacitorThaums > amt) {
                that.thaumaticCapacitorThaums -= amt
                return true
            }

            that.thaumaticCapacitorThaums = 0
            return false
        },

        createDamageModel() {
            var dmg = that.damageModel

            dmg.addArea(dmg.make("engine", 100, {
                damage: that.drive.onDamage,
                destroy: that.drive.onDestroy
            }))

            dmg.addArea(dmg.make("lift", 25, {
                damage: that.lift.onDamage,
                destroy: that.lift.onDestroy
            }))
        },

        tick() {
            if(that.masterLights > 0 && that.pilotLights) {
                that.lightFuel -= that.masterLights
                if(that.lightFuel < 0)
                    that.lightFuel = 0
            }

            that.reactor.cycle()
            that.lift.cycle()
            that.drive.cycle()

            mover(engine)
        }
    }

    that.reactor = makeReactor(engine, that)
    that.drive = makeDrive(engine, that)
    that.lift = makeLift(engine, that)
    return that
}