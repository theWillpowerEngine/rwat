var tiles = require("./tiles.js")

module.exports = (obj) => {
    var that = {
        fill(tile) {
            for(var x=0; x<that.width; x++)
                for(var y=0; y<that.height; y++)
                    that.tiles[x][y] = { ...tile }
        },

        apply(iX, iY, change, w, h) {
            debugger;
            if(!w) w = 1
            if(!h) h = 1
            for(var x=iX; x<iX+w; x++)
                for(var y=iY; y<iY+h; y++)
                    that.tiles[x][y] = {
                        ...that.tiles[x][y],
                        ...change 
                    }
        },

        draw(tile, x, y, o) {
            that.tiles[x][y] = { ...tile, ...o }
        },

        hline(tile, x, y, length, o) {
            for(var dX=0; dX < length && that.width > dX + x; dX++)
                that.tiles[x + dX][y] = { ...tile, ...o }
        },
        vline(tile, x, y, length, o) {
            for(var dY=0; dY < length && that.height > dY + y; dY++)
                that.tiles[x][y+dY] = { ...tile, ...o }
        },
        rect(tile, x, y, w, h, o) {
            that.hline(tile, x, y, w, o)
            that.hline(tile, x, y+h-1, w, o)
            that.vline(tile, x, y, h, o)
            that.vline(tile, x+w-1, y, h, o)
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
     
        door(x, y, desc, map, dX, dY, emit) {
            that.tiles[x][y] = tiles.merge(tiles.door, { 
                desc: desc || "a door",
                destMap: map,
                destX: dX,
                destY: dY,
                emit
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
                wrap: false,
                char: (eng, tile) => {
                    return tile.val || '0'
                },
                handler: (eng, t) => {
                    t.val += eng.player.turnValve
                    if(t.val < t.min)
                        t.val = t.wrap ? t.max : t.min
                    if(t.val > t.max)
                        t.val = t.wrap ? t.min : t.max

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