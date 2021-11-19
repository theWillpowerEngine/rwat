const Color = require('color')
const colors = require("../map/colors.js")

function applyLightFallOff(light, intens, x, y) {
    if(light.fo) {
        let range = engine.rangeBetween(light.x, light.y, x, y)
        let fo = light.fo * (-1 * range)
        intens = intens - fo
        if(intens < 0) intens = 0

        return intens
    }

}

module.exports = (eng) => {
    let engine = eng
    var that = {
        ambient: null,
        sources: [],

        clear() {
            that.sources = []
        },
        
        getAll() {
            if(engine.player.lightOn) {
                return [
                    ...that.sources,
                    {
                        ...engine.renderer.playerLightSource(),
                        x: engine.player.x,
                        y: engine.player.y
                    }

                ]
            } else {
                return [
                    ...that.sources,
                ]
            }
        },
        create(color, intensity, range, fallOff) {
            return {
                color,
                intensity,
                range,
                fo: fallOff || 0,
                x: 0,
                y: 0
            }
        },
        add(x, y, color, intensity, range, fallOff) {
            that.sources.push({
                color,
                intensity,
                range,
                fo: fallOff || 0,
                x,
                y
            })
        },
        setAmbient(c) {
            that.ambient = { ...c, ambient: true }
        },

        getLightAt(x, y) {
            var allLights = that.getAll()
            var relevantLights = allLights.filter(l => {
                if(l.intensity <= 0)
                    return false

                return engine.rangeBetween(x, y, l.x, l.y) <= l.range
            })

            if(relevantLights.length == 0)
                return that.ambient
            else
            {
                relevantLights = relevantLights.sort((a, b) => {
                    return applyLightFallOff(b, b.intensity, x, y) - applyLightFallOff(a, a.intensity, x, y)
                })
                var intensity = relevantLights[0].intensity
                var color = relevantLights[0].color
                intensity = applyLightFallOff(relevantLights[0], intensity, x, y)

                for(var i=1; i<relevantLights.length; i++) {
                    let light = relevantLights[i]
                    let intens = light.intensity
                    intens = applyLightFallOff(light, intens, x, y)

                    intens = (intens - intensity) + 0.5
                    color = Color(color).mix(Color(light.color), intens)
                }
            }

            return that.create(color, intensity, 1)    

        }
    }
    that.ambient = that.create("#000000", 0, 1)

    return that
}