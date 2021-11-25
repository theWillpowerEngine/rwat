const ui= {
    modal(content) {
        escStack.push(() => {})
        setTimeout(() => {
            $.modal(content)
        }, 0)
        
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
    }
}