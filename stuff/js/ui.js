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
        if(content)
            ui.modal(content)
    },

    updateUI() {
        $("#area").html(engine?.map?.name || "Unknown Area")
    }
}