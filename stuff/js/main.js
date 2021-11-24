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

window["cheat"] = {
    backRoom() {
        engine.scenes.set("dev")
        engine.render()
    },
    tel(place) {
        engine.scenes.set(place)
        engine.render()
    },
    warp(x, y) {
        engine.player.x = x
        engine.player.y = y
        engine.render()
    }

}

$(() => {
    engine.init((step, msg) => {
        logMsg(`<span class='log-item'>Step ${step} done: ${msg}.</span>`)
    })
    engine.render()

    $("canvas").on('mousedown', e => {
        var coords = getCursorPosition(e.target, e)
        coords.x = Math.trunc(coords.x /= 20)
        coords.y = Math.trunc(coords.y /= 20)
        var tile = engine.renderer.getTileAt(coords.x + engine.lastOffsetX, coords.y + engine.lastOffsetY)
        if(tile) {
            if(typeof tile.desc === 'function')
                logMsg(`<span class='log-item'>${tile.desc(engine, tile)}</span>`)
            else
                logMsg(`<span class='log-item'>That's ${tile.desc}.</span>`)
        }
    })

    var resizeTimer;
    $(window).on('resize', function(e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            engine.render()
        }, 250);
    });

})