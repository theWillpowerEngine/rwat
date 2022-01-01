module.exports = (eng, cr) => {
    let engine = eng
    let crew = cr

    let that = {
        path(path) {
            var ret = {
                type: "path",
                path: [...path]
            }
            return ret
        }
    }

    return that
}