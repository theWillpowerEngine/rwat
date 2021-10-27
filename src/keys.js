let { ipcRenderer } = require("electron")

window.keyBinds = {
    moveUp: 'w',
    moveDown: 's',
    moveLeft: 'a',
    moveRight: 'd',
    moveNW: 'shift+w',
    moveNE: 'shift+d',
    moveSE: 'shift+s',
    moveSW: 'shift+a',

    devTools: 'F12',
    exit: 'escape',
}

module.exports = (eng, kbs) => {
    let engine = eng
    let binds = {
        ...window.keyBinds,
        ...kbs
    }

    // Movement
    hotkeys(binds.moveNE, function (event, handler){
        engine.player.move(1, -1)
        engine.render()
    });
    hotkeys(binds.moveSE, function (event, handler){
        engine.player.move(1, 1)
        engine.render()
    });
    hotkeys(binds.moveSW, function (event, handler){
        engine.player.move(-1, 1)
        engine.render()
    });
    hotkeys(binds.moveNW, function (event, handler){
        engine.player.move(-1, -1)
        engine.render()
    });
    hotkeys(binds.moveDown, function (event, handler){
        engine.player.move(0, 1)
        engine.render()
    });
    hotkeys(binds.moveLeft, function (event, handler){
        engine.player.move(-1, 0)
        engine.render()
    });
    hotkeys(binds.moveRight, function (event, handler){
        engine.player.move(1, 0)
        engine.render()
    });
    hotkeys(binds.moveUp, function (event, handler){
        engine.player.move(0, -1)
        engine.render()
    });

    hotkeys(binds.exit, function (event, handler){
        window.close()
    });
    hotkeys(binds.devTools, async function (event, handler){
        await ipcRenderer.invoke("showDev")
    });

}