module.exports = (eng) => {
    let engine = eng

    var that = {
        isPointInsideCircle(circle_x, circle_y, rad, x, y)
        {
            if ((x - circle_x) * (x - circle_x) +
                (y - circle_y) * (y - circle_y) <= rad * rad)
                return true
            else
                return false
        },

        //Pred:  (iX, iY, map.tiles[iX][iY])
        any(mapName, x, y, range, pred) {
            let map = engine.maps[mapName]
            if(!engine.boundsCheck(x, y, map))
                return

            for(var iX = x - range; iX < x + range; iX++) {
                for(var iY = y - range; iY < y + range; iY++) {
                    if(!boundsCheck(iX, iY, map))
                        continue
                    if(!that.isPointInsideCircle(x, y, range, iX, iY))
                        continue

                    if(pred(iX, iY, map.tiles[iX][iY]))
                        return {
                            x: iX,
                            y: iY,
                            tile: map.tiles[iX][iY] 
                        }
                }    
            }
        }
    }

    return that
}