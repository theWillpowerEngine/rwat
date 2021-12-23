const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")
const colors = require("../../map/colors.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            var theMap = engine.maps["topDeck"] = map.blank(103, 105)
            theMap.name = 'Top Deck / Wheelhouse'
            theMap.deckName = 'topDeck'
            theMap.isShip = true

            //#region basic framing/layout
            theMap.fill(tiles.spaceBorder)
            theMap.apply(40, 20, tiles.shipFloor, 23, 65)

            theMap.rect(tiles.shipWall, 40, 62, 23, 23)
            theMap.rect(tiles.shipWall, 43, 66, 19, 19)
            theMap.apply(62, 67, tiles.space, 1, 18)
            theMap.apply(44, 66, tiles.horizontalWindow, 17, 1)

            theMap.apply(60, 66, tiles.localDoor)
            theMap.apply(43, 67, tiles.localDoor)

            theMap.door(60, 62, "the door to the officer's cabins", "officerDeck", 20, 1, "You enter the officer's cabin")

            theMap.door(60, 82, "a set of stairs leading down to the officer's deck", "officerDeck", 20, 17, "You go down the stairs")
            theMap.apply(60, 79, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true,
                transparent: true
            }, 1, 3)
            theMap.apply(60, 82, { transparent: true })

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