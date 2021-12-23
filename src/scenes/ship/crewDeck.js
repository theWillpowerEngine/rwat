const colors = require("../../map/colors.js")
const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            var theMap = engine.maps["crewDeck"] = map.blank(23, 65)
            
            theMap.name = 'Crew Deck'
            theMap.deckName = 'crewDeck'
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

            //galley, freezer and pantry
            theMap.rect(tiles.shipWall, 13, 26, 10, 10)            
            theMap.rect(tiles.shipWall, 13, 22, 7, 5)       //Pantry
            theMap.rect(tiles.shipWall, 19, 18, 4, 9)       //Freezer

            //sick bay
            theMap.rect(tiles.shipWall, 0, 26, 10, 10)

            //simple quarters
            theMap.rect(tiles.shipWall, 2, 20, 5, 5)
            theMap.rect(tiles.shipWall, 6, 20, 5, 5)
            theMap.rect(tiles.shipWall, 2, 16, 5, 5)
            theMap.rect(tiles.shipWall, 6, 16, 5, 5)

            theMap.rect(tiles.shipWall, 12, 12, 5, 5)
            theMap.rect(tiles.shipWall, 16, 12, 5, 5)
            theMap.rect(tiles.shipWall, 12, 8, 5, 5)
            theMap.rect(tiles.shipWall, 16, 8, 5, 5)

            theMap.rect(tiles.shipWall, 2, 12, 5, 5)
            theMap.rect(tiles.shipWall, 6, 12, 5, 5)
            theMap.rect(tiles.shipWall, 2, 8, 5, 5)
            theMap.rect(tiles.shipWall, 6, 8, 5, 5)

            //bathroom & showers
            theMap.rect(tiles.shipWall, 19, 3, 4, 6)
            /////////////
            //#endregion

            //#region doors

            theMap.door(4, 55, "the engine room door", "engineRoom", 1, 1, "You enter the engine room")
            
            theMap.door(1, 62, "a set of stairs leading down to the cargo deck", "cargoDeck", 1, 57, "You go down the stairs")
            theMap.apply(1, 58, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true
            }, 1, 4)
            theMap.apply(1, 58, {transparent: true}, 1, 5)

            theMap.door(19, 2, "a U-shaped staircase down to the cargo deck", "cargoDeck", 19, 1, "You go down the stairs")
            theMap.apply(20, 1, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true
            }, 2, 2)
            theMap.apply(12, 2, {transparent: true}, 1, 5)
            
            theMap.door(21, 53, "a set of stairs leading up to the officer's deck", "officerDeck", 21, 17, "You go up the stairs")
            theMap.apply(21, 50, {
                bg: colors.stairs,
                desc: "a staircase",
                solid: true
            }, 1, 3)
            theMap.apply(21, 53, {transparent: true}, 1, 5)

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