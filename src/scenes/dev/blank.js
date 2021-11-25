const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")
const colors = require("../../map/colors.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            var theMap = engine.maps["blank"] = map.blank(5, 5)
            
            theMap.fill(tiles.space)

            theMap.addButton(2, 1, "something you can click to get more information", (eng, tile) => {
                ui.modal("This room is substituting for a main menu at the moment.  The left 'N' button will start a new game, the right 'L' button will load your save.")
            }, {
                color: colors.byakuya,
                char: '?'
            })
            
            theMap.addButton(4, 1, "the button to click to load your game (you could also press Ctrl-O)", async (eng, tile) => {
                await engine.load()
                engine.render()
            }, {
                color: colors.gold,
                char: 'L'
            })

            theMap.addButton(0, 1, "the button to click to start a new game (good luck!)", (eng, tile) => {
                //TODO:  chargen
            }, {
                color: colors.green,
                char: 'N'
            })

        },
        applyLights() {
            engine.lights.setAmbient(engine.lights.create(colors.white, 0.3, 0.3))
        }
    }

    return that
}