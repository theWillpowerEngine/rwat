let { ipcMain } = require("electron")

module.exports = (win) => {
    let browser = win
    
    ipcMain.handle("showDev", (event, line) => {
        console.log(browser)
        browser.openDevTools()
    })
}