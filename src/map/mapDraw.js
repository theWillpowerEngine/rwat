var tiles = require("./tiles.js")

module.exports = (obj) => {
    var that = {
        fill(tile) {
            for(var x=0; x<that.width; x++)
                for(var y=0; y<that.height; y++)
                    that.tiles[x][y] = { ...tile }
        },

        draw(tile, x, y) {
            that.tiles[x][y] = { ...tile }
        },

        hline(tile, x, y, length) {
            for(var dX=0; dX < length && that.width > dX + x; dX++)
                that.tiles[x + dX][y] = { ...tile }
        },
        vline(tile, x, y, length) {
            for(var dY=0; dY < length && that.height > dY + y; dY++)
                that.tiles[x][y+dY] = { ...tile }
        },

        addSwitch(x, y, desc, on, off, o) {
            that.tiles[x][y] = tiles.merge(tiles.switch, { 
                desc,
                on,
                off,
                char: (eng, tile) => {
                    return tile.state ? '$' : '%'
                },
                state: false,
                handler: (eng, t) => {
                    t.state = !t.state
                    if(t.state)
                        t.on(eng, t)
                    else
                        t.off(eng, t)
                },

                ...o
             })
        },
        addButton(x, y, desc, event, o) {
            that.tiles[x][y] = tiles.merge(tiles.button, { 
                desc,
                handler: event,

                ...o
             })
        },
     
        addDisplay(x, y, desc, displayer, o) {
            that.tiles[x][y] = tiles.merge(tiles.display, { 
                desc,
                char: displayer,

                ...o
             })
        },
        addValve(x, y, desc, min, max, start, cb, o) {
            that.tiles[x][y] = tiles.merge(tiles.switch, { 
                desc,
                min,
                max,
                val: start,
                char: (eng, tile) => {
                    return tile.val || '0'
                },
                handler: (eng, t) => {
                    t.val += eng.player.turnValve
                    if(t.val < t.min)
                        t.val = t.max
                    if(t.val > t.max)
                        t.val = t.min

                    if(cb)
                        cb(t)
                },

                ...o
             })
        },

        getPointsBetween(x1,y1,x2,y2) {
            var coordinatesArray = new Array();
            var dx = Math.abs(x2 - x1);
            var dy = Math.abs(y2 - y1);
            var sx = (x1 < x2) ? 1 : -1;
            var sy = (y1 < y2) ? 1 : -1;
            var err = dx - dy;

            while (!((x1 == x2) && (y1 == y2))) {
                var e2 = err << 1;
                if (e2 > -dy) {
                    err -= dy;
                    x1 += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y1 += sy;
                }
                coordinatesArray.push([x1, y1]);
            }
            coordinatesArray.splice(coordinatesArray.length-1, 1)
            return coordinatesArray;
        },

        ...obj
    }

    return that
}