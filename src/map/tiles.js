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
        desc: "A tile",

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
        isPC: true,
        desc: "you (duh)"
    }),

    switch: makeTile({
        solid: true,
        char: "$",
        color: "white",
        interactive: true,
        transparent: true,
        desc: "a switch"
    }),
    button: makeTile({
        solid: true,
        char: "©",
        color: "white",
        interactive: true,
        transparent: true,
        desc: "a button"
    }),

    display: makeTile({
        solid: true,
        char: "0",
        color: "grey",
        interactive: false,
        transparent: false,
        desc: "a gauge"
    }),

    shipFloor: makeTile({
        solid: false,
        char: ".",
        color: color.grey,
        desc: "just some floor"
    }),
    shipWall: makeTile({
        char: "#",
        color: color.grey,
        desc: "a wall"

    }),

}