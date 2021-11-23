const ui= {
    escStack: [],
    handleEsc(handler) {
        if(handler)
            ui.escStack.push(handler)
        else {
            if(ui.escStack.length == 0)
                return      //Could also pop up a menu like in most MMOS?
            ui.escStack.pop()()
        }
    },

    async help(topic) {
        if(!topic) topic = "index"
        var content = await engine.getHelp(topic)
        alert(content)
    }
}