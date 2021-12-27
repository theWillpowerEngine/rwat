const cmStates = {
    pickTarget: 0,
    singleTargetCommand: 1
}
window["commandMenuState"] = 0

const commandMenu = {
    subjectCrew: null,

    tick(engine) {
        engine.commands.clearOverride()
        let html = ''
        switch(commandMenuState) {
            case cmStates.pickTarget:
                var nearbyCrew = engine.crew.filter(c => c.deck == engine.map.deckName && engine.detector.isPointInsideCircle(engine.player.x, engine.player.y, engine.player.commandRange(), c.x, c.y))
                let i = 0
                if(nearbyCrew && nearbyCrew.length) {
                    for(var crew of nearbyCrew) {
                        html += `${commandKeys[i]}) &nbsp;${crew.name}`
                        engine.commands.overrideCommands[i] = () => {
                            commandMenu.subjectCrew = crew
                            commandMenuState = cmStates.singleTargetCommand
                            $("#command-menu").html(commandMenu.tick(engine))
                        }
                        i++
                    }
                } else
                    html = "There's no one close enough"
               break

            case cmStates.singleTargetCommand:
                var crew = commandMenu.subjectCrew
                html = ""
                var orders = crew.allOrders()
                var keys = Object.keys(orders)
                keys.sort((a, b) => {
                    return orders[a].preferredKey - orders[b].preferredKey
                })
                for(var o of keys) {
                    var order = orders[o]
                    html += `${commandKeys[order.preferredKey]})  ${order.description}<br />`
                    let closureOrder = order
                    engine.commands.overrideCommands[closureOrder.preferredKey] = () => {
                        return closureOrder.act(engine, crew)
                    }    
                }
                break
        }

        return `<div id="command-menu">${html.trim()}</div>`
    }
}   