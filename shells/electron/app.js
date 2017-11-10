const { app, BrowserWindow } = require('electron')

let mainWindow = null

app.on('window-all-closed', () => app.quit())
app.on('ready', () => {
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  mainWindow.loadURL('file://' + __dirname + '/app.html')

  mainWindow.on('closed', () => mainWindow = null)
})