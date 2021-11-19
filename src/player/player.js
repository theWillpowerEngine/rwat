const tiles = require("../map/tiles")

module.exports = (eng) => {
    let engine = eng
    var that = {
        name: "Spatula Fitzsimmons",
        x: 1,
        y: 1,
        tile: tiles.player,
        isPC: true,
        turnValve: -1,

        move(dX, dY) {
            if(Math.abs(dX) > 1 || Math.abs(dY) > 1)
                return
            
            var nX = that.x + dX,
                nY = that.y + dY

            var bc = engine.boundsCheck(nX, nY) 
            if(!bc.ib) {
                if(bc.tile?.interactive)
                    engine.interact(false, nX, nY)
                return
            }

            that.x = nX
            that.y = nY
        },

        distToDirect(x, y) {
            return engine.rangeBetween(x, y, that.x, that.y)
        }
    }

    return that
}