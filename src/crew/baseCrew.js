const colors = require("../map/colors")
const nameGen = require("../world/gens/crewNameGen")
const PF = require('pathfinding')

const baseCrew = {
    name: "Placeholder McGee",
    char: "B",
    color: colors.shipUniform,
    deck: "cargoDeck",
    type: null, 
    x: 15,
    y: 15
}

module.exports = (eng, o) => {
    let engine = eng
    let ship = engine.ship

    let name = nameGen.getName(engine) 
    var that = {
        ...baseCrew,
        
        name: name.name,

        ...o,

        path: null,
        pathfind(x, y) {
            var matrix = engine.getPathfindingMap(engine.maps[that.deck])
            var grid = new PF.Grid(matrix)
            var finder = new PF.AStarFinder({
                diagonalMovement: PF.DiagonalMovement.Always
            })
            var path = finder.findPath(that.x, that.y, x, y, grid)
            return path
        },

        move(dX, dY, map) {
            if(Math.abs(dX) > 1 || Math.abs(dY) > 1)
                return
            
            var nX = that.x + dX,
                nY = that.y + dY

            var bc = engine.boundsCheck(nX, nY, map) 
            if(!bc.ib)
                return

            that.x = nX
            that.y = nY
        },
    }

    if(!o || !o.char) {
        if(eng.crew.find(c => c.char == name.last[0]))
            that.char = name.first[0]
        else
            that.char = name.last[0]
    }
    
    return that
}