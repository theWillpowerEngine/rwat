const makeCrew = require("../../crew/baseCrew")
const types = require("../../crew/enums/type")
const state = require("../../crew/enums/state")

module.exports = {
    makeEngineer(eng) {
        return makeCrew(eng, {
            type: types.airman,
            state: state.idle
        })
    }
}