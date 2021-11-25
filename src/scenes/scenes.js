const sceneMasterList = require("./masterList.js")

module.exports = (eng) => {
    let engine = eng

    var that = {
        all: {

        },
        current: null,
        get(name) {
            if(name)
                return that.all[name.toLowerCase()]
            
            return that.all[that.current.toLowerCase()]
        },
        set(name) {
            that.current = name
            engine.map = engine.maps[name]
            engine.lights.clear()
            that.get().applyLights()
        },

        loadAll() {
            for(var scn of sceneMasterList.all) {
                var scene = require(sceneMasterList[scn])(engine)
                scene.makeMap()
                that.all[scn.toLowerCase()] = scene
            }
            return sceneMasterList.all.length
        }
    }
    
    return that
}