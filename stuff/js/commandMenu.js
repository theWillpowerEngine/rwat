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
                html = "1) Go to 5,5"
                var crew = commandMenu.subjectCrew
                engine.commands.overrideCommands[0] = () => {
                    crew.pathfind(5, 5)
                    $.modal.close()
                    escStack.pop()()
                }
                break
        }

        return `<div id="command-menu">${html.trim()}</div>`
    }
}   