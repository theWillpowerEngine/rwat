let { ipcMain } = require("electron")
const fs = require('fs')

module.exports = (win) => {
    let browser = win
    let fullscreen = true
    
    ipcMain.handle("showDev", (event, line) => {
        browser.openDevTools()
    })

    ipcMain.handle("toggleFullscreen", (event, line) => {
        browser.setFullScreen(!fullscreen)
        fullscreen = !fullscreen
    })

    ipcMain.handle("save", (event, json) => {
        fs.writeFileSync("save.game", json, 'utf8')
    })

    ipcMain.handle("load", (event, engine) => {
        var data = fs.readFileSync("save.game", 'utf8')
        return data
    })

    ipcMain.handle("help", (event, topic) => {
        try {
            var data = fs.readFileSync(`unclesJournal\\${topic}.htm`, 'utf8')
            return data
        } catch(ex) {
            var data = fs.readFileSync(`unclesJournal\\index.htm`, 'utf8')
            return data
        }
    })

    ipcMain.handle("zelazny", (event, topic) => {
        try {
            var data = fs.readFileSync(`zelazny\\${topic}`, 'utf8')
            return data
        } catch(ex) {
            return "Zelazny '" + topic + "' was not found"
        }
    })

    ipcMain.handle("icon", (event, topic) => {
        try {
            var data = fs.readFileSync(`stuff\\icons\\${topic}.svg`, 'utf8')
            return data
        } catch(ex) {
            return null
        }
    })
}