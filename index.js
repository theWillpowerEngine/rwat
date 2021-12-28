const { app, BrowserWindow } = require('electron')
const registerInterop = require("./src/interop")

function createWindow () {
  app.on('window-all-closed', () => {
    app.quit()
  })

  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    frame: false,
    show: false,
    icon: __dirname + '/stuff/icon.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

    win.setFullScreen(true)
    win.show()
    //win.openDevTools()
    registerInterop(win)
    
    win.loadFile('index.htm')
  }

  app.whenReady().then(() => {
    createWindow()
  })