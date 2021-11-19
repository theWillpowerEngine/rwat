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
}