module.exports = (eng, cr) => {
    let engine = eng
    let crew = cr

    let that = {
        path(pt) {
            var ret = {
                type: "path",
                x: pt.x,
                y: pt.y
            }
            return ret
        },
        useDoor(x, y) {
            var ret = {
                type: "door",
                x,
                y
            }
            return ret
        }
    }

    return that
}