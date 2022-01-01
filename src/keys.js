let { ipcRenderer } = require("electron")
const renderModes = require("./render/renderModes")

window.keyBinds = {
    moveUp: 'w',
    moveDown: 's',
    moveLeft: 'a',
    moveRight: 'd',
    moveNW: 'shift+w',
    moveNE: 'shift+d',
    moveSE: 'shift+s',
    moveSW: 'shift+a',

    viewLayers: "tab",

    advanceTick: "space",
    advance5Ticks: "shift+space",
    advance10Ticks: "ctrl+space",
    advance25Ticks: "ctrl+shift+space",

    commandMenu: "c",
    command1: "1",
    command2: "2",
    command3: "3",
    command4: "4",
    command5: "5",
    command6: "q",
    command7: "e",
    command8: "r",
    command9: "f",
    command10: "g",
    command11: "shift+1",
    command12: "shift+2",
    command13: "shift+3",
    command14: "shift+4",
    command15: "shift+5",
    command16: "shift+q",
    command17: "shift+e",
    command18: "shift+r",
    command19: "shift+f",
    command20: "shift+g",

    toggleLight: "l",

    characterSheet: "shift+c",

    plus: "=",
    minus: "-",

    save: "ctrl+s",
    load: "ctrl+o",

    toggleValve: "t",
    devTools: 'F12',
    exit: 'shift+escape',
    help: 'F1',
    helpHome: 'shift+F1',
}

window["escStack"] = []
window["commandKeys"] = []

module.exports = (eng, kbs) => {
    let engine = eng
    let binds = {
        ...window.keyBinds,
        ...kbs
    }

    for(var x=1; x<21; x++) {
        commandKeys[x-1] = keyBinds["command" + x]
        let closureX = x
        hotkeys(binds["command" + x], async function (event, handler){
            if(await engine.commands.doCommand(closureX-1)) {
                $.modal.close()
                engine.commands.clearOverride()
                commandMenu.reset()
                escStack.pop()
                await engine.render()
            }
        })
    
    }

    hotkeys(binds.viewLayers, async function (event, handler){
        switch(engine.renderer.mode) {
            case renderModes.localMap:
                engine.renderer.mode = renderModes.worldMap
                break
            
            default:
                engine.renderer.mode = renderModes.localMap

        }
        await engine.render()
    })

    hotkeys(binds.plus, async function (event, handler){
        if(engine.renderer.worldMap.zoom > 1)
           engine.renderer.worldMap.zoom -= 1
        
        await engine.render()
    })
    hotkeys(binds.minus, async function (event, handler){
        if(engine.renderer.worldMap.zoom < 40)
            engine.renderer.worldMap.zoom += 1
        await engine.render()
    })

    // Movement
    hotkeys(binds.moveNE, async function (event, handler){
        switch(engine.renderer.mode) {
            case renderModes.localMap:
                engine.player.move(1, -1)
                break
            case renderModes.worldMap:
                engine.renderer.worldMap.x += 2 * engine.renderer.worldMap.zoom
                engine.renderer.worldMap.y -= 2 * engine.renderer.worldMap.zoom
                break
        }
        await engine.render()
    })
    hotkeys(binds.moveSE, async function (event, handler){
        switch(engine.renderer.mode) {
            case renderModes.localMap:
                engine.player.move(1, 1)
                break
            case renderModes.worldMap:
                engine.renderer.worldMap.x += 2 * engine.renderer.worldMap.zoom
                engine.renderer.worldMap.y += 2 * engine.renderer.worldMap.zoom
                break
        }
        await engine.render()
    })
    hotkeys(binds.moveSW, async function (event, handler){
        switch(engine.renderer.mode) {
            case renderModes.localMap:
                engine.player.move(-1, 1)
                break
            case renderModes.worldMap:
                engine.renderer.worldMap.x -= 2 * engine.renderer.worldMap.zoom
                engine.renderer.worldMap.y += 2 * engine.renderer.worldMap.zoom
                break
        }
        await engine.render()
    })
    hotkeys(binds.moveNW, async function (event, handler){
        switch(engine.renderer.mode) {
            case renderModes.localMap:
                engine.player.move(-1, -1)
                break
            case renderModes.worldMap:
                engine.renderer.worldMap.x -= 2 * engine.renderer.worldMap.zoom
                engine.renderer.worldMap.y -= 2 * engine.renderer.worldMap.zoom
                break
        }
        await engine.render()
    })
    hotkeys(binds.moveDown, async function (event, handler){
        switch(engine.renderer.mode) {
            case renderModes.localMap:
                engine.player.move(0, 1)
                break
            case renderModes.worldMap:
                engine.renderer.worldMap.y += 2 * engine.renderer.worldMap.zoom
                break
        }
        await engine.render()
    })
    hotkeys(binds.moveLeft, async function (event, handler){
        switch(engine.renderer.mode) {
            case renderModes.localMap:
                engine.player.move(-1, 0)
                break
            case renderModes.worldMap:
                engine.renderer.worldMap.x -= 2 * engine.renderer.worldMap.zoom
                break
        }
        await engine.render()
    })
    hotkeys(binds.moveRight, async function (event, handler){
        switch(engine.renderer.mode) {
            case renderModes.localMap:
                engine.player.move(1, 0)
                break
            case renderModes.worldMap:
                engine.renderer.worldMap.x += 2 * engine.renderer.worldMap.zoom
                break
        }
        await engine.render()
    })
    hotkeys(binds.moveUp, async function (event, handler){
        switch(engine.renderer.mode) {
            case renderModes.localMap:
                engine.player.move(0, -1)
                break
            case renderModes.worldMap:
                engine.renderer.worldMap.y -= 2 * engine.renderer.worldMap.zoom
                break
        }
        await engine.render()
    })

    //Interaction toggles
    hotkeys(binds.toggleValve, async function (event, handler){
        engine.player.turnValve = (engine.player.turnValve == -1 ? 1 : -1)
        engine.log(`You will now turn valves and dials ${(engine.player.turnValve == -1 ? "down" : "up")}.`)
        await engine.render()
    })
    hotkeys(binds.toggleLight, async function (event, handler){
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
        await engine.render()
    })

    //"Social" Interactions
    hotkeys(binds.commandMenu, async function (event, handler){
        await ui.commandMenu()
    })

    //Misc. Actions
    hotkeys(binds.advanceTick, async function (event, handler){
        if(ui.inZelazny) {
            $(".default-link").click()
        } else {
            engine.log("You wait a moment.")
            await engine.render()
        }
    })
    hotkeys(binds.advance5Ticks, async function (event, handler){
        engine.render(5)
    })
    hotkeys(binds.advance10Ticks, async function (event, handler){
        engine.render(10)
    })
    hotkeys(binds.advance25Ticks, async function (event, handler){
        engine.render(25)
    })

    hotkeys(binds.characterSheet, async function (event, handler){
        ui.charSheet()
    })

    //System Keys
    hotkeys(binds.save, async function (event, handler){
        await engine.save()
        await engine.render()
    })
    hotkeys(binds.load, async function (event, handler){
        await engine.load()
        await engine.render()
    })

    hotkeys(binds.exit, async function (event, handler){
        window.close()
    })
    hotkeys(binds.devTools, async function (event, handler){
        await ipcRenderer.invoke("showDev")
    })

    hotkeys(binds.helpHome, async function (event, handler){
        await ui.help()
    })
    hotkeys(binds.help, async function (event, handler){
        var topic = engine?.map?.helpTopic || null
        await ui.help(topic)
    })

    //Hard Binds
    hotkeys('alt+enter', async function(e, h){
        await ipcRenderer.invoke("toggleFullscreen")
    })
    hotkeys('escape', async function(e, h){
        if(escStack.length) {
            var f =escStack.pop()
            if(f())
                escStack.push(f) 
        } else
            if(confirm("Are you sure you want to exit?"))
                window.close()
    })

}