//0 - Pick Target
//1 - Issue Command
window["commandMenuState"] = 0

const commandMenu = {
    tick(engine) {
        let html = ''
        switch(commandMenuState) {
            case 0:
                var nearbyCrew = engine.crew.filter(c => c.deck == engine.map.deckName && engine.detector.isPointInsideCircle(engine.player.x, engine.player.y, engine.player.commandRange(), c.x, c.y))
                let i = 0
                if(nearbyCrew && nearbyCrew.length) {
                    for(var crew of nearbyCrew) {
                        html += `${commandKeys[i]}) &nbsp;${crew.name}`
                        engine.commands.overrideCommands[i] = () => {
                            engine.log(crew.name)
                            $.modal.close()
                            escStack.pop()()
                        }
                        i++
                    }
                } else
                    html = "There's no one close enough"
                return html.trim()
        }
    }
}   