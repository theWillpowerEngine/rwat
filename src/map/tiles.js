var color = require("./colors.js")
var Color = require("color")

const makeTile = (vals) => {
    return {
        solid: true,
        char: ' ',
        color: color.white,
        bg: null,
        transparent: false,
        interactive: false,
        noBgLightTint: false,

        ...vals
    }
}

var that = module.exports = {
    makeTile: makeTile,
    merge(base, extra) {
        return {
            ...base,
            ...extra,
        }
    },

    player: makeTile({
        solid: true,
        char: "@",
        color: "#0000ff",
        bg: color.lantern,  //Color(color.lantern).mix(Color(color.background), 0.5).hex(),
        isPC: true
    }),

    switch: makeTile({
        solid: true,
        char: "$",
        color: "white",
        interactive: true,
        transparent: true
    }),

    shipFloor: makeTile({
        solid: false,
        char: ".",
        color: color.grey
    }),
    shipWall: makeTile({
        char: "#",
        color: color.grey
    }),

}