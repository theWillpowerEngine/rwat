const { ipcRenderer } = require("electron")
const makeEngine = require("./src/engine.js")

const getCursorPosition = (canvas, event) => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return {x, y}
}
const logMsg = msg => {
    var $log = $("#log")
    $log.append(msg)
    $log[0].scrollTop = $log[0].scrollHeight;
}

window.onerror = function(msg, url, line, col, error) {
    var extra = !col ? '' : '\ncolumn: ' + col;
    extra += !error ? '' : '\nerror: ' + error;

    var suppressErrorAlert = false;
    ipcRenderer.invoke("showDev")
    return suppressErrorAlert;
}

const engine = makeEngine(logMsg)

$(() => {
    engine.init((step, msg) => {
        logMsg(`Step ${step} done: ${msg}.<br )/>`)
    })
    engine.render()

    $("canvas").on('mousedown', e => {
        var coords = getCursorPosition(e.target, e)
        coords.x = Math.trunc(coords.x /= 20)
        coords.y = Math.trunc(coords.y /= 20)
        var tile = engine.renderer.getTileAt(coords.x, coords.y)
        if(tile)
            logMsg("That's " + tile.desc + "<br />")
    })

    var resizeTimer;
    $(window).on('resize', function(e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            engine.render()
        }, 250);
    });
})