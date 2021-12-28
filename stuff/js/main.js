const { ipcRenderer } = require("electron")
const makeEngine = require("./src/engine")

const getCursorPosition = (canvas, event) => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return {x, y}
}
const logMsg = msg => {
    var $log = $("#log")
    $log.append(msg)
    $log[0].scrollTop = $log[0].scrollHeight
}

window.onerror = function(msg, url, line, col, error) {
    var extra = !col ? '' : '\ncolumn: ' + col
    extra += !error ? '' : '\nerror: ' + error

    var suppressErrorAlert = false
    ipcRenderer.invoke("showDev")
    return suppressErrorAlert
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

$(async () => {
    var initter = engine.getInitObject()
    ui.modal("Riven World: Airship Trader is Loading...<br /><br /><div id='load-stuff'> </div>")

    setTimeout(() => {
        initter.start()
        .andThen(() => {$("#load-stuff").append("-Engine initialization complete<br />")})

        setTimeout(() => {
            initter.next()
                .andThen(() => {$("#load-stuff").append("-Zelazny storytelling System initialized<br />")})
        
            setTimeout(() => {
                initter.next()
                    .andThen(() => {$("#load-stuff").append("-Loaded all maps and saved copies for delta-checks<br />")})

                setTimeout(() => {
                    initter.next()
                        .andThen(() => {$("#load-stuff").append("-Generated terrain and finished ship initalization<br />")})
                
                    setTimeout(() => {
                        initter.next()
                        $("#load-stuff").append("<br /><center><b>Load complete!<b></center>")
                        setTimeout(async () => {
                            $.modal.close()
                            escStack.pop()

                            await engine.render()

                            var resizeTimer
                            $(window).on('resize', function(e) {
                                clearTimeout(resizeTimer)
                                resizeTimer = setTimeout(async function() {
                                    $.modal.update("60%", "60%")
                                    await engine.render()
                                }, 250)
                            })
                            
                            $("canvas").on('mousedown', e => {
                                var coords = getCursorPosition(e.target, e)
                                coords.x = Math.trunc(coords.x /= 20)
                                coords.y = Math.trunc(coords.y /= 20)

                                var tile = null
                                if(engine.renderer.mode == "world") {
                                    tile = engine.renderer.getTileAt(coords.x + engine.lastOffsetX, coords.y + engine.lastOffsetY, engine.renderer._.prevs.dW, engine.renderer._.prevs.dH, engine.renderer._.prevs.oX, engine.renderer._.prevs.oY)
                                } else {
                                    tile = engine.renderer.getTileAt(coords.x + engine.lastOffsetX, coords.y + engine.lastOffsetY)
                                }
                                    
                                if(tile) {
                                    if(typeof tile.desc === 'function')
                                        logMsg(`<span class='log-item'>${tile.desc(engine, tile)}</span>`)
                                    else
                                        logMsg(`<span class='log-item'>That's ${tile.desc}.</span>`)
                                }
                            })
                        }, 1000)
                    }, 250)
                }, 250)            
            }, 250)
        }, 250)
    }, 150)
})