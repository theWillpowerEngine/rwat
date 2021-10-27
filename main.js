const { app, BrowserWindow } = require('electron')
const registerInterop = require("./src/interop.js")

function createWindow () {
  app.on('window-all-closed', () => {
    app.quit()
  })

  const win = new BrowserWindow({
    // width: 600,
    // height: 400,
    titleBarStyle: "hidden",
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

    win.maximize()
    win.setFullScreen(true)
    win.loadFile('index.htm')
    win.show()

    registerInterop(win)
  }

  app.whenReady().then(() => {
    createWindow()
  })