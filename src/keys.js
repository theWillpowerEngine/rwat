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

    advanceTick: "shift+space",

    toggleLight: "l",

    save: "ctrl+s",
    load: "ctrl+o",

    toggleValve: "t",
    devTools: 'F12',
    exit: 'shift+escape',
    help: 'F1',
    helpHome: 'shift+F1',
}

module.exports = (eng, kbs) => {
    let engine = eng
    let binds = {
        ...window.keyBinds,
        ...kbs
    }

    //Fixed binds
    hotkeys("escape", function (event, handler){
        ui.handleEsc()
    })

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

    //Interaction toggles
    hotkeys(binds.toggleValve, function (event, handler){
        engine.player.turnValve = (engine.player.turnValve == -1 ? 1 : -1)
        engine.log(`You will now turn valves and dials ${(engine.player.turnValve == -1 ? "down" : "up")}.`)
        engine.render()
    });
    hotkeys(binds.toggleLight, function (event, handler){
        engine.player.lightOn = !engine.player.lightOn
        if(engine.player.lightOn) {
            if(engine.player.lightFuel > 0)
                engine.log("You light your personal lantern.")
            else {
                engine.log("There is no fuel in your lantern, you can't turn it on.")
                engine.player.lightOn = false
            }    
        } else
            engine.log("You turn your personal lantern off.")
        engine.render()
    });

    //Misc. Actions
    hotkeys(binds.advanceTick, function (event, handler){
        engine.render()
    });

    //System Keys
    hotkeys(binds.save, async function (event, handler){
        await engine.save()
        engine.render()
    });
    hotkeys(binds.load, async function (event, handler){
        await engine.load()
        engine.render()
    });

    hotkeys(binds.exit, function (event, handler){
        window.close()
    });
    hotkeys(binds.devTools, async function (event, handler){
        await ipcRenderer.invoke("showDev")
    });

    hotkeys(binds.helpHome, async function (event, handler){
        await ui.help()
    });
    hotkeys(binds.help, async function (event, handler){
        var topic = engine?.map?.helpTopic || null
        await ui.help(topic)
    });

    hotkeys('alt+enter', async function(e, h){
        await ipcRenderer.invoke("toggleFullscreen")
    })

}