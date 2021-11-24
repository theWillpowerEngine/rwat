const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            engine.maps["crewDeck"] = map.blank(23, 75)
            var theMap = engine.maps.crewDeck
            theMap.fill(tiles.shipFloor)

            theMap.vline(tiles.shipWall, 0, 0, 75)
            theMap.vline(tiles.shipWall, 22, 0, 75)

            theMap.hline(tiles.shipWall, 0, 0, 23)
            theMap.hline(tiles.shipWall, 0, 74, 23)
            
            //engine room
            theMap.hline(tiles.shipWall, 3, 63, 20)
            theMap.vline(tiles.shipWall, 3, 63, 10)
            theMap.door(4, 63, "the engine room door", "engineRoom", 1, 1, "You enter the engine room")

        },
 
        applyLights() {
            engine.lights.setAmbient(engine.ship.getMasterAmbientLight())
        }
    }

    return that
}