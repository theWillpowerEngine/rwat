var colors = require("./colors.js")
var Color = require("color")

const makeTile = (vals) => {
    return {
        solid: true,
        char: ' ',
        color: colors.white,
        bg: null,
        transparent: false,      //for solids
        notTransparent: false,   //For non solids
        interactive: false,
        noBgLightTint: false,
        desc: "A tile",
        useOutdoorAmbience: false,

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
        color: colors.cornwallis,
        bg: colors.lantern,
        isPC: true,
        desc: "you (duh)"
    }),

    crew: (crew) => makeTile({
        solid: true,
        char: crew.char,
        color: crew.color,
        bg: crew.bg || null,
        desc: `${crew.name}`
    }),

    switch: makeTile({
        solid: true,
        char: "$",
        color: colors.white,
        interactive: true,
        transparent: true,
        desc: "a switch"
    }),
    button: makeTile({
        solid: true,
        char: "©",
        color: colors.white,
        interactive: true,
        transparent: true,
        desc: "a button"
    }),

    display: makeTile({
        solid: true,
        char: "0",
        color: colors.grey,
        interactive: false,
        transparent: false,
        desc: "a gauge"
    }),

    door: makeTile({
        solid: true,
        char: "*",
        color: colors.lemonade,
        desc: "a door",
        interactive: true,
        destMap: null,
        destX: null,
        destY: null,
        emit: null,
        handler: (eng, tile) => {
            if(!tile.destMap)
                throw "Door without destination map: " + JSON.stringify(tile)

            eng.scenes.set(tile.destMap)
            eng.player.x = tile.destX
            eng.player.y = tile.destY
            if(tile.emit)
                eng.log(tile.emit)
        }
    }),

    localDoor: makeTile({
        solid: false,
        char: "*",
        color: colors.aqua,
        desc: "a door",
        notTransparent: true
    }), 

    horizontalWindow: makeTile({
        solid: true,
        char: "-",
        color: colors.grey,
        interactive: false,
        transparent: true,
        desc: "a window pane"
    }),
    verticalWindow: makeTile({
        solid: true,
        char: "|",
        color: colors.grey,
        interactive: false,
        transparent: true,
        desc: "a window pane"
    }),

    shipFloor: makeTile({
        solid: false,
        char: ".",
        color: colors.grey,
        desc: "just some floor"
    }),
    shipWall: makeTile({
        char: "#",
        color: colors.grey,
        desc: "a wall"
    }),
    space: makeTile({
        solid: false,
        char: " ",
        color: colors.background,
        desc: "just empty space"
    }),
    spaceBorder: makeTile({
        solid: true,
        char: " ",
        color: colors.background,
        desc: "empty space"
    }),
}