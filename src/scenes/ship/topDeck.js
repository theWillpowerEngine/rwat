const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")
const colors = require("../../map/colors.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            var theMap = engine.maps["topDeck"] = map.blank(23, 65)
                        
            theMap.name = 'Top Deck / Wheelhouse'
            theMap.isShip = true

            //#region basic framing/layout
            theMap.fill(tiles.shipFloor)

            theMap.rect(tiles.shipWall, 0, 42, 23, 23)            


            theMap.door(20, 42, "the door to the officer's cabins", "officerDeck", 20, 1, "You enter the officer's cabin")

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