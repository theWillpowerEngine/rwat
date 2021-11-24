const ui= {
    modal(content) {
        $.modal(content)
    },

    async help(topic) {
        if(!topic) topic = "index"
        var content = await engine.getHelp(topic)
        ui.modal(content)
    },

    async zelazny(story, file) {
        var content = await engine.getZelazny(story, file)
        content = engine.zelazny.parse(content)
        $("#zelazny").html(content)

        let bind = () => {
            if(!engine.zelazny.over)
                $(".action-link").off('click').on('click', e => {
                    var $t = $(e.target)
                    var action = $(`[data-id=${$t.attr("data-action")}]`).text()
                    
                    var text = engine.zelazny.action(action)
                    if(engine.zelazny.over)
                        text += `<br /><center>${engine.zelazny.over}</center><br /><center><a class="zelazny-close" onclick='escStack.pop()()'>Close</a></center>`
        
                    $("#zelazny").html(text)
                    bind()
                })
        }
        bind()

        $("#zelazny").fadeIn()

        escStack.push(() => {
            engine.zelazny.done()
            $("#zelazny").fadeOut()
        })
    },

    updateUI() {
        $("#area").html(engine?.map?.name || "Unknown Area")
    }
}