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
            theMap.rect(tiles.shipWall, 3, 46, 19, 19)
            theMap.apply(22, 47, tiles.space, 1, 18)
            
            theMap.door(20, 42, "the door to the officer's cabins", "officerDeck", 20, 1, "You enter the officer's cabin")

            theMap.door(20, 62, "a set of stairs leading down to the officer's deck", "officerDeck", 20, 17, "You go down the stairs")
            theMap.apply(20, 59, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true,
                transparent: true
            }, 1, 3)
            theMap.apply(20, 18, { transparent: true })

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