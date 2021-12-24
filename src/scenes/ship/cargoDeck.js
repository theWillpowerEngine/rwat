const map = require("../../map/map") 
const tiles = require("../../map/tiles")
const colors = require("../../map/colors")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            var theMap = engine.maps["cargoDeck"] = map.blank(23, 65)
                        
            theMap.name = 'Cargo Deck'
            theMap.deckName = 'cargoDeck'
            theMap.isShip = true

            //#region basic framing/layout
            theMap.fill(tiles.shipFloor)

            theMap.rect(tiles.shipWall, 0, 0, 23, 65)            

            //machine room and bonus rooms
            theMap.rect(tiles.shipWall, 2, 45, 19, 20)
            theMap.vline(tiles.shipFloor, 20, 57, 7) 
            theMap.draw(tiles.shipWall, 21, 56)

            //bathroom
            theMap.rect(tiles.shipWall, 19, 23, 4, 6)

            ////////////
            //#endregion

            //#region doors

            theMap.door(1, 58, "a set of stairs leading up to the crew deck", "crewDeck", 1, 63, "You go up the stairs")
            theMap.apply(1, 58, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true,
                transparent: true
            }, 1, 5)
            theMap.apply(1, 58, {transparent: true}, 1, 5)

            theMap.door(20, 1, "a U-shaped staircase up to the crew deck", "crewDeck", 18, 2, "You go down the stairs")
            theMap.apply(21, 1, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true
            })
            theMap.apply(20, 2, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true
            }, 2)
            theMap.apply(20, 1, {transparent: true}, 1, 5)

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