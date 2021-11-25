const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            var theMap = engine.maps["crewDeck"] = map.blank(23, 65)
            
            theMap.name = 'Crew Deck'
            theMap.isShip = true

            //#region basic framing/layout
            theMap.fill(tiles.shipFloor)

            theMap.rect(tiles.shipWall, 0, 0, 23, 65)
            
            //engine room
            theMap.rect(tiles.shipWall, 3, 55, 20, 10)

            //officer quarters and bathroom
            theMap.rect(tiles.shipWall, 2, 46, 8, 8)
            theMap.rect(tiles.shipWall, 13, 46, 8, 8)
            theMap.hline(tiles.shipWall, 10, 47, 4)
            theMap.hline(tiles.shipWall, 10, 53, 4)

            //galley
            theMap.rect(tiles.shipWall, 0, 26, 10, 10)
            
            //sick bay
            theMap.rect(tiles.shipWall, 13, 26, 10, 10)

            //simple quarters
            theMap.rect(tiles.shipWall, 2, 20, 5, 5)
            theMap.rect(tiles.shipWall, 6, 20, 5, 5)
            theMap.rect(tiles.shipWall, 2, 16, 5, 5)
            theMap.rect(tiles.shipWall, 6, 16, 5, 5)

            theMap.rect(tiles.shipWall, 12, 20, 5, 5)
            theMap.rect(tiles.shipWall, 16, 20, 5, 5)
            theMap.rect(tiles.shipWall, 12, 16, 5, 5)
            theMap.rect(tiles.shipWall, 16, 16, 5, 5)

            theMap.rect(tiles.shipWall, 12, 12, 5, 5)
            theMap.rect(tiles.shipWall, 16, 12, 5, 5)
            theMap.rect(tiles.shipWall, 12, 8, 5, 5)
            theMap.rect(tiles.shipWall, 16, 8, 5, 5)

            //bathroom & showers
            theMap.rect(tiles.shipWall, 0, 11, 4, 6)
            theMap.rect(tiles.shipWall, 19, 3, 4, 6)
            /////////////
            //#endregion

            //#region doors

            theMap.door(4, 55, "the engine room door", "engineRoom", 1, 1, "You enter the engine room")
            theMap.door(1, 62, "a set of stairs leading down to the cargo deck", "cargoDeck", 1, 57, "You go down the stairs")
            
            ////////////
            //#endregion


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