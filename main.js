const { app, BrowserWindow } = require('electron')
const registerInterop = require("./src/interop.js")

function createWindow () {
  app.on('window-all-closed', () => {
    app.quit()
  })

  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

    win.setFullScreen(true)
    win.loadFile('index.htm')
    win.show()

    registerInterop(win)
  }

  app.whenReady().then(() => {
    createWindow()
  })