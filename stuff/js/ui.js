const ui = {
    inZelazny: false,

    modal(content, cb) {
        escStack.push(() => { if(cb) cb() })
        setTimeout(() => {
            $.modal(content, {
                position: ["20%","20%"],
                containerCss:{
                    height:"60%", 
                    width:"60%"
                },
                autoResize:true,
                autoPosition: true
            })
        }, 0)
    },

    async makeIconBox(icon, color) {
        var svg = await engine.getIcon(icon)
        svg = svg.replace('fill="#000"', `fill="${color}"`)
        svg = Buffer.from(svg).toString('base64')
        var html = `
<div class="icon-box"><img src="data:image/svg+xml;base64,${svg}" class="icon" /></div>
        `

        return html.trim()
    },

    charSheet() {
        var skills = `
        <table width="100%" style="border: 0 0 0 0">
            <tr>
                <td>Airmanship: <b>${engine.player.airmanship}</b></td>
                <td>Animal Husbandry: <b>${engine.player.animals}</b></td>
                <td>Appraisal: <b>${engine.player.appraisal}</b></td>
            </tr>
            <tr>
                <td>Chemistry: <b>${engine.player.chemistry}</b></td>
                <td>Cooking: <b>${engine.player.cooking}</b></td>
                <td>Divination: <b>${engine.player.divination}</b></td>
            </tr>
            <tr>
                <td>Engineering: <b>${engine.player.engineering}</b></td>
                <td>Farming: <b>${engine.player.farming}</b></td>
                <td>Firearms: <b>${engine.player.firearms}</b></td>
            </tr>
            <tr>
                <td>Fishing: <b>${engine.player.fishing}</b></td>
                <td>Flash Steps: <b>${engine.player.flashSteps}</b></td>
                <td>Gambling: <b>${engine.player.gambling}</b></td>
            </tr>
            <tr>
                <td>Intellect: <b>${engine.player.intellect}</b></td>
                <td>Knack: <b>${engine.player.knack}</b></td>
                <td>Larceny: <b>${engine.player.larceny}</b></td>
            </tr>
            <tr>
                <td>Leadership: <b>${engine.player.leadership}</b></td>
                <td>Luck: <b>${engine.player.luck}</b></td>
                <td>Manipulation: <b>${engine.player.manipulation}</b></td>
            </tr>
            <tr>
                <td>Martial Arts: <b>${engine.player.martialArts}</b></td>
                <td>Medicine: <b>${engine.player.medicine}</b></td>
                <td>Mining: <b>${engine.player.mining}</b></td>
            </tr>
            <tr>
                <td>Music/Barding: <b>${engine.player.barding}</b></td>
                <td>Navigation: <b>${engine.player.navigation}</b></td>
                <td>Negotiation: <b>${engine.player.negotiation}</b></td>
            </tr>
            <tr>
                <td>Reaction: <b>${engine.player.reaction}</b></td>
                <td>Resilience: <b>${engine.player.resilience}</b></td>
                <td>Sorcery: <b>${engine.player.sorcery}</b></td>
            </tr>
            <tr>
                <td>Soul Edge: <b>${engine.player.edge}</b></td>
                <td>Strength: <b>${engine.player.strength}</b></td>
                <td> </td>
            </tr>
        </table>
        `
        
        var html = `
        <center><b>${engine.player.name}</b></center>
        <br />
        ${skills}
        `

        ui.modal(html)
    },

    async help(topic) {
        if(!topic) topic = "index"
        var content = await engine.getHelp(topic)
        ui.modal('<div id="help-container">' + content + "<div>")

        let bindHelpLinks = () => {
            setTimeout(() => {
                $(".help-link").off('click').on('click', async e => {
                    let linkTopic = $(e.target).attr("data-help")
                    $("#help-container").html(await engine.getHelp(linkTopic))
                    bindHelpLinks()
                })    
            }, 250)
        }
        bindHelpLinks()
    },

    async zelazny(story, file, allowEsc) {
        var content = await engine.getZelazny(story, file)
        content = engine.zelazny.parse(content)
        if(engine.zelazny.over)
            content += `<br /><br /><center>${engine.zelazny.over}</center><br /><center><a class="zelazny-close" onclick='escStack.pop()(1)'>Close</a></center>`

        $("#zelazny").html(content)

        let bind = () => {
            if(!engine.zelazny.over)
                $(".action-link").off('click').on('click', e => {
                    var $t = $(e.target)
                    var action = $(`[data-id=${$t.attr("data-action")}]`).text()
                    
                    var text = engine.zelazny.action(action)
                    if(engine.zelazny.over)
                        text += `<br /><br /><center>${engine.zelazny.over}</center><br /><center><a class="zelazny-close default-link" onclick='escStack.pop()(1)'>Close</a></center>`
        
                    $("#zelazny").html(text)
                    bind()
                })
        }
        bind()

        ui.inZelazny = true
        $("#zelazny").fadeIn()

        escStack.push((v) => {
            if(!allowEsc && !v)
                return true

            engine.zelazny.done()
            $("#zelazny").fadeOut()
            ui.inZelazny = false
        })
    },

    async commandMenu() {
        var html = commandMenu.tick(engine)
        ui.modal(html, () => {
            engine.commands.clearOverride()
            commandMenu.reset()
        })
    }, 

    async updateUI() {
        $("#area").html(engine?.map?.name || (engine.renderer.mode == "world" ? "World Map" : null) || "Unknown Area")
        if(engine?.world?.getDateTime)
            $("#time").html(engine.world.getDateTime())
        else
            $("#time").html("")

        var html = `<br /><br />
<b>Hdg: </b> ${engine.ship.heading}<br />
<b>Speed: </b> ${engine.ship.movementVector.speed}<br />
<b>Alt: </b> ${engine.ship.z - engine.world.terrainMap[Math.floor(engine.ship.x)][Math.floor(engine.ship.y)]}<br />
<b>dAlt: </b> ${engine.ship.movementVector.z}<br />
<b>gGap: </b> ${engine.world.gridHeightFor(Math.floor(engine.ship.x), Math.floor(engine.ship.y)) - engine.ship.z}<br />

<b>X: </b> ${engine.ship.x}<br />
<b>Y: </b> ${engine.ship.y}<br />
<b>dZ: </b> ${engine.ship.movementVector.z}<br />
<b>EL: </b> ${engine.ship.movementVector.effectiveLift}<br />`

        //html += await ui.makeIconBox('cog', "red")
        $("#sidetop").html(html)

        if(engine?.gameOver) {
            ui.modal("<b>Game Over: </b> " + engine.gameOver)
            $("#area").html("Game Over")
            $("#time").html("")
        }
    }
}