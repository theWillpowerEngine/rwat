const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            engine.maps["crewDeck"] = map.blank(23, 75)
            var theMap = engine.maps.crewDeck
            
            theMap.name = 'Crew Deck'
            theMap.isShip = true

            theMap.fill(tiles.shipFloor)

            theMap.rect(tiles.shipWall, 0, 0, 23, 75)
            
            //engine room
            theMap.rect(tiles.shipWall, 3, 65, 20, 10)
            theMap.door(4, 65, "the engine room door", "engineRoom", 1, 1, "You enter the engine room")

            //officer quarters and bathroom
            theMap.rect(tiles.shipWall, 2, 56, 8, 8)
            theMap.rect(tiles.shipWall, 13, 56, 8, 8)
            theMap.hline(tiles.shipWall, 10, 57, 4)
            theMap.hline(tiles.shipWall, 10, 63, 4)

            //On Tick
            theMap.tickHandler = () => {
                engine.lights.setAmbient(engine.ship.getMasterAmbientLight())
            }
        },
 
        applyLights() {

        }
    }

    return that
}