const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")
const colors = require("../../map/colors.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            var theMap = engine.maps["upperDeck"] = map.blank(23, 23)
                        
            theMap.name = "Officer's Deck"
            theMap.isShip = true

            //#region basic framing/layout
            theMap.fill(tiles.shipFloor)

            theMap.rect(tiles.shipWall, 0, 0, 23, 23)            

            ////////////
            //#endregion

            //#region doors

            theMap.door(21, 18, "a set of stairs leading down to the crew deck", "crewDeck", 21, 54, "You go down the stairs")
            theMap.apply(21, 19, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true,
                transparent: true
            }, 1, 3)
            theMap.apply(21, 18, { transparent: true })

            theMap.door(20, 18, "a set of stairs leading up to the wheelhouse", "topDeck", 20, 63, "You go up the stairs")
            theMap.apply(20, 19, {
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