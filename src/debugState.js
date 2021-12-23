const crewFactory = require("./world/gens/crewFactory")

module.exports = (eng) => {
    let engine = eng
    let ship = eng.ship
    let player = eng.player
    let crew = eng.crew

    crew.push(crewFactory.makeEngineer(eng))
}