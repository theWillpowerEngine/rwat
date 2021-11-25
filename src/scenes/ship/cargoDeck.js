const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            var theMap = engine.maps["cargoDeck"] = map.blank(23, 65)
                        
            theMap.name = 'Cargo Deck'
            theMap.isShip = true

            //#region basic framing/layout
            theMap.fill(tiles.shipFloor)

            theMap.rect(tiles.shipWall, 0, 0, 23, 65)            
            ////////////
            //#endregion


            //#region doors

            theMap.door(1, 58, "a set of stairs leading up to the crew deck", "crewDeck", 1, 63, "You go up the stairs")
    
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