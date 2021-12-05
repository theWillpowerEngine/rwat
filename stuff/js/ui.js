const ui= {
    modal(content) {
        escStack.push(() => {})
        setTimeout(() => {
            $.modal(content)
        }, 0)
        
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
                <td>Negotiation: <b>${engine.player.negotiation}</b></td>
                <td>Reaction: <b>${engine.player.reaction}</b></td>
            </tr>
            <tr>
                <td>Resilience: <b>${engine.player.resilience}</b></td>
                <td>Sorcery: <b>${engine.player.sorcery}</b></td>
                <td>Soul Edge: <b>${engine.player.edge}</b></td>
            </tr>
            <tr>
                <td>Strength: <b>${engine.player.strength}</b></td>
                <td> </td>
                <td> </td>
            </tr>
        </table>
        `
        
        var html = `
        <center><b>${engine.player.name}</b></center>
        <br />
        ${skills}
        `
        debugger
        ui.modal(html)
    },

    async help(topic) {
        if(!topic) topic = "index"
        var content = await engine.getHelp(topic)
        ui.modal(content)
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
                        text += `<br /><br /><center>${engine.zelazny.over}</center><br /><center><a class="zelazny-close" onclick='escStack.pop()(1)'>Close</a></center>`
        
                    $("#zelazny").html(text)
                    bind()
                })
        }
        bind()

        $("#zelazny").fadeIn()

        escStack.push((v) => {
            if(!allowEsc && !v)
                return true

            engine.zelazny.done()
            $("#zelazny").fadeOut()
        })
    },

    updateUI() {
        $("#area").html(engine?.map?.name || "Unknown Area")
        if(engine?.world?.getDateTime)
            $("#time").html(engine.world.getDateTime())
        else
            $("#time").html("")
    }
}