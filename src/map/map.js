const tile = require("./tiles.js")
const mapDraw = require("./mapDraw.js")

function makeMap(partial) {
    var that = {
        width: 0,
        height: 0,
        tiles: null,

        ...partial
    }

    that.tiles = Array(that.width).fill(0).map(x => Array(that.height).fill(tile.makeTile()))

    return mapDraw(that)
}

module.exports = {
    empty() { return makeMap() },
    blank(w, h) {
        var map = makeMap({
            width: w,
            height: h
        })
        return map
    }
}