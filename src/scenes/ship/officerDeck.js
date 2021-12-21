const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")
const colors = require("../../map/colors.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            var theMap = engine.maps["officerDeck"] = map.blank(23, 23)
                        
            theMap.name = "Officer's Deck"
            theMap.isShip = true

            //#region basic framing/layout
            theMap.fill(tiles.shipFloor)

            theMap.rect(tiles.shipWall, 0, 0, 23, 23)            

            //captain's quarters and ready room
            theMap.rect(tiles.shipWall, 0, 16, 20, 7)

            //officer rooms
            theMap.rect(tiles.shipWall, 0, 0, 7, 7)
            theMap.rect(tiles.shipWall, 6, 0, 7, 7)
            theMap.rect(tiles.shipWall, 12, 0, 7, 7)

            theMap.rect(tiles.shipWall, 2, 8, 7, 7)
            theMap.rect(tiles.shipWall, 8, 8, 7, 7)
            theMap.rect(tiles.shipWall, 14, 8, 7, 7)

            ////////////
            //#endregion

            //#region doors

            theMap.door(20, 0, "the door outside", "topDeck", 60, 61, "You head outside")

            theMap.door(21, 18, "a set of stairs leading down to the crew deck", "crewDeck", 21, 54, "You go down the stairs")
            theMap.apply(21, 19, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true,
                transparent: true
            }, 1, 3)
            theMap.apply(21, 18, { transparent: true })

            theMap.door(20, 18, "a set of stairs leading up to the wheelhouse", "topDeck", 60, 83, "You go up the stairs")
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