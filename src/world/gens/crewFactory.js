const baseOfficer = require("../../crew/baseOfficer")

module.exports = {
    makeEngineer(eng) {
        return baseOfficer(eng, {
            type: "Engineer"
        })
    }
}