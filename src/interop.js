let { ipcMain } = require("electron")

module.exports = (win) => {
    let browser = win
    let fullscreen = true
    
    ipcMain.handle("showDev", (event, line) => {
        console.log(browser)
        browser.openDevTools()
    })

    ipcMain.handle("toggleFullscreen", (event, line) => {
        browser.setFullScreen(!fullscreen)
        fullscreen = !fullscreen
    })
}