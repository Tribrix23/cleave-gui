import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Set application name early before ready
app.setName('CleaveDB')

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'CleaveDB',
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 500,
    center: true,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    backgroundColor: '#ffffff',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximize-change', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-maximize-change', false)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('CleaveDB')
  app.setAppUserModelId('CleaveDB')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Window control IPC handlers
  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
  })

  ipcMain.handle('window-is-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.isMaximized() ?? false
  })

  // Smooth window maximization
  ipcMain.handle('window-maximize-smooth', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    if (win.isMaximized()) return true

    const startBounds = win.getBounds()
    const currentDisplay = screen.getDisplayMatching(startBounds)
    const targetBounds = currentDisplay.workArea

    const duration = 280
    const steps = 18
    const interval = duration / steps
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

    for (let i = 1; i <= steps; i++) {
      if (win.isDestroyed()) break
      const progress = easeOutCubic(i / steps)
      const current = {
        x: Math.round(startBounds.x + (targetBounds.x - startBounds.x) * progress),
        y: Math.round(startBounds.y + (targetBounds.y - startBounds.y) * progress),
        width: Math.round(startBounds.width + (targetBounds.width - startBounds.width) * progress),
        height: Math.round(startBounds.height + (targetBounds.height - startBounds.height) * progress)
      }
      win.setBounds(current)
      await new Promise((r) => setTimeout(r, interval))
    }

    if (!win.isDestroyed()) {
      win.maximize()
    }
    return true
  })

  // Smooth window restore when signing out
  ipcMain.handle('window-restore-smooth', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return false
    if (!win.isMaximized()) return true

    win.unmaximize()
    win.setBounds({ width: 1200, height: 800 })
    win.center()
    return true
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
