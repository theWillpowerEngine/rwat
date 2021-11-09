const map = require("../../map/map.js") 
const tiles = require("../../map/tiles.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        makeMap() {
            engine.maps["dev"] = map.blank(20, 20)
            engine.maps.dev.fill(tiles.shipFloor)
            engine.maps.dev.draw(tiles.shipWall, 5, 5)
            engine.maps.dev.draw(tiles.shipWall, 5, 15)
            engine.maps.dev.draw(tiles.shipWall, 15, 15)
            engine.maps.dev.draw(tiles.shipWall, 15, 5)

            engine.maps.dev.addSwitch(5, 6, "Light control", 
                (eng, tile) => {    
                    for(var light of engine.lights.sources) {
                        light.intensity = 1
                    }  
                    engine.log("You turn the lights on.")
                }, 
                (eng, tile) => { 
                    for(var light of engine.lights.sources) {
                        light.intensity = 0
                    }
                    engine.log("You turn the lights off.")  
                }, {state: true})
        },
        applyLights() {
            engine.lights.setAmbient(engine.lights.create("pink", 0.3, 0.3))
            
            engine.lights.add(5, 5, "red", 1, 3, -0.2)
            engine.lights.add(15, 5, "green", 1, 3, -0.2)
            engine.lights.add(5, 15, "blue", 1, 3, -0.25)
            engine.lights.add(15, 15, "orange", 1, 3, -0.25)
        }
    }

    return that
}