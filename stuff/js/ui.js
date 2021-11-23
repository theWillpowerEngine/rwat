const ui= {
    modal(content) {
        $.modal(content)
    },

    async help(topic) {
        if(!topic) topic = "index"
        var content = await engine.getHelp(topic)
        ui.modal(content)
    }
}