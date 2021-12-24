const colors = require("../map/colors")
const nameGen = require("../world/gens/crewNameGen")

const baseCrew = {
    name: "Placeholder McGee",
    char: "B",
    color: colors.shipUniform,
    deck: "cargoDeck",
    type: "Student", 
    x: 15,
    y: 15
}

module.exports = (eng, o) => {
    let engine = eng
    let ship = engine.ship

    let name = nameGen.getName(engine) 
    var that = {
        ...baseCrew,
        
        name: name.name,

        ...o,

        
    }

    if(eng.crew.find(c => c.char == name.last[0]))
        that.char = name.first[0]
    else
        that.char = name.last[0]

    return that
}