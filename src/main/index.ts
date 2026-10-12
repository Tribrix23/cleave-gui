import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import * as fs from 'fs'
import * as net from 'net'
import { spawn, ChildProcess } from 'child_process'
import { CleaveDB } from 'cleavedb'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Set application name early before ready
app.setName('CleaveDB')

const RESTORED_WIDTH = 1250
const RESTORED_HEIGHT = 820

let cleaveProcess: ChildProcess | null = null

function getCleaveShellPath(): string {
  const possiblePaths = [
    join(app.getAppPath(), 'cleaveshell', 'cleaveshell.exe'),
    join(process.resourcesPath, 'cleaveshell', 'cleaveshell.exe'),
    join(process.cwd(), 'cleaveshell', 'cleaveshell.exe'),
    join(__dirname, '../../cleaveshell', 'cleaveshell.exe'),
    join(__dirname, 'cleaveshell', 'cleaveshell.exe')
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  return ''
}

function isServerRunning(port = 8300, host = '127.0.0.1', timeout = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(timeout)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => {
      resolve(false)
    })
    socket.connect(port, host)
  })
}

async function ensureCleaveServerRunning(): Promise<boolean> {
  const running = await isServerRunning(8300)
  if (running) return true

  const exePath = getCleaveShellPath()
  if (!exePath) {
    console.warn('CleaveShell executable not found; attempting connection to existing CleaveDB instance.')
    return false
  }

  console.log('Starting CleaveDB server from:', exePath)
  try {
    cleaveProcess = spawn(exePath, ['--run-server'], {
      cwd: join(exePath, '..'),
      detached: true,
      stdio: 'ignore'
    })
    cleaveProcess.unref()

    // Wait for server to bind port 8300
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500))
      if (await isServerRunning(8300)) {
        console.log('CleaveDB server started successfully!')
        return true
      }
    }
  } catch (err) {
    console.error('Error starting cleaveshell server:', err)
  }
  return false
}


function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'CleaveDB',
    width: RESTORED_WIDTH,
    height: RESTORED_HEIGHT,
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
    mainWindow.setBounds({ width: RESTORED_WIDTH, height: RESTORED_HEIGHT })
    mainWindow.center()
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
        win.setBounds({ width: RESTORED_WIDTH, height: RESTORED_HEIGHT })
        win.center()
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
    if (!win.isMaximized()) {
      win.setBounds({ width: RESTORED_WIDTH, height: RESTORED_HEIGHT })
      win.center()
      return true
    }

    win.unmaximize()
    win.setBounds({ width: RESTORED_WIDTH, height: RESTORED_HEIGHT })
    win.center()
    return true
  })

  // Get real computer storage/disk space
  ipcMain.handle('get-system-storage', () => {
    try {
      const rootPath = process.platform === 'win32' ? 'C:\\' : '/'
      const s = fs.statfsSync(rootPath)
      const totalBytes = Number(s.blocks) * Number(s.bsize)
      const freeBytes = Number(s.bavail ?? s.bfree) * Number(s.bsize)
      const usedBytes = Math.max(0, totalBytes - freeBytes)
      const totalGB = parseFloat((totalBytes / 1073741824).toFixed(1))
      const freeGB = parseFloat((freeBytes / 1073741824).toFixed(1))
      const usedGB = parseFloat((usedBytes / 1073741824).toFixed(1))
      const percentUsed = Math.min(100, Math.max(0, Math.round((usedBytes / totalBytes) * 100)))
      return {
        totalGB,
        freeGB,
        usedGB,
        percentUsed,
        drive: process.platform === 'win32' ? 'C:' : '/'
      }
    } catch (err) {
      console.error('Failed to get disk storage:', err)
      return {
        totalGB: 256.0,
        freeGB: 48.5,
        usedGB: 207.5,
        percentUsed: 81,
        drive: 'C:'
      }
    }
  })

  let currentSession = {
    username: '',
    password: '',
    authLevel: 'standard',
    isSuperUser: false
  }

  // ----------------------------------------------------
  // CleaveDB Authentication IPC Handlers (via npm cleavedb)
  // ----------------------------------------------------
  ipcMain.handle('auth-login', async (_event, { username, password }) => {
    try {
      await ensureCleaveServerRunning()
      const cleanUser = (username || '').trim()
      const cleanPass = password || ''
      if (!cleanUser) {
        return { success: false, error: 'Username is required' }
      }

      const db = new CleaveDB({
        host: '127.0.0.1',
        port: 8300,
        username: cleanUser,
        password: cleanPass,
        timeoutMs: 6000
      })

      const res = await (db as any).sendOneShot(8300, {
        action: 'login',
        username: cleanUser,
        password: cleanPass
      })

      if (res && res.status === 'ok') {
        const isSuperUser = res.auth_level === 'dev'
        currentSession = {
          username: res.username || cleanUser,
          password: cleanPass,
          authLevel: res.auth_level || 'standard',
          isSuperUser
        }
        return {
          success: true,
          username: res.username || cleanUser,
          authLevel: res.auth_level || 'standard',
          isSuperUser
        }
      } else {
        return { success: false, error: res?.message || 'Invalid username or password' }
      }
    } catch (err: any) {
      const raw = err?.message || 'Invalid username or password'
      const error = raw.replace(/^Authentication failed:\s*/i, '').trim()
      return { success: false, error: error || 'Invalid username or password' }
    }
  })

  ipcMain.handle('auth-get-session', () => ({
    username: currentSession.username,
    authLevel: currentSession.authLevel,
    isSuperUser: currentSession.isSuperUser
  }))

  // Fetch real CleaveDB metrics snapshot
  ipcMain.handle('cleavedb-get-telemetry', async () => {
    try {
      const db = new CleaveDB({ host: '127.0.0.1', port: 8300, metricsPort: 8303 })
      const metrics = await db.getMetrics()
      return { success: true, metrics }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to fetch metrics' }
    }
  })

  // Execute real CleaveQL query
  ipcMain.handle('cleavedb-execute-query', async (_event, sql: string) => {
    try {
      if (currentSession.username && currentSession.password) {
        try {
          const db = new CleaveDB({
            host: '127.0.0.1',
            port: 8300,
            username: currentSession.username,
            password: currentSession.password
          })
          await db.connect()
          const results = await db.query(sql)
          db.disconnect()
          return { success: true, results }
        } catch {
          // fallback to socket query below
        }
      }

      // Direct socket query to port 8300
      const results = await new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const net = require('net')
        const client = new net.Socket()
        let out = ''
        const timer = setTimeout(() => {
          client.destroy()
          if (out) {
            try {
              resolve(JSON.parse(out))
            } catch {
              resolve(out)
            }
          } else {
            reject(new Error('Query execution timed out'))
          }
        }, 4000)

        client.connect(8300, '127.0.0.1', () => {
          client.write(sql.trim().replace(/\r?\n/g, ' ') + '\n')
        })
        client.on('data', (d: Buffer) => {
          out += d.toString()
          try {
            const parsed = JSON.parse(out)
            clearTimeout(timer)
            client.destroy()
            resolve(parsed)
          } catch {
            // Wait for full chunk
          }
        })
        client.on('error', (err: Error) => {
          clearTimeout(timer)
          client.destroy()
          reject(err)
        })
      })
      return { success: true, results }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Query failed' }
    }
  })

  ipcMain.handle('auth-register', async (_event, { username, password, devPassword, question, answer }) => {
    try {
      await ensureCleaveServerRunning()
      const cleanUser = (username || '').trim()
      const cleanPass = password || ''
      const cleanAnswer = (answer || '').trim()
      const cleanQuestion = (question || '').trim()

      if (!cleanUser) {
        return { success: false, error: 'Username is required' }
      }
      if (!cleanPass) {
        return { success: false, error: 'Password is required' }
      }
      if (!cleanQuestion || !cleanAnswer) {
        return { success: false, error: 'Security question and answer are required' }
      }

      const db = new CleaveDB({
        host: '127.0.0.1',
        port: 8300,
        timeoutMs: 6000
      })

      const res = await db.register({
        username: cleanUser,
        password: cleanPass,
        devPassword: (devPassword || '').trim(),
        question: cleanQuestion,
        answer: cleanAnswer
      })

      if (res && res.status === 'ok') {
        return { success: true, message: res.message || 'Registration successful! You can now login.' }
      } else {
        return { success: false, error: res?.message || 'Registration failed' }
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' }
    }
  })

  ipcMain.handle('auth-get-security-question', async (_event, { username }) => {
    try {
      await ensureCleaveServerRunning()
      const cleanUser = (username || '').trim()
      if (!cleanUser) {
        return { success: false, error: 'Username is required' }
      }

      const db = new CleaveDB({
        host: '127.0.0.1',
        port: 8300,
        timeoutMs: 6000
      })

      const question = await db.getSecurityQuestion(cleanUser)
      return { success: true, question }
    } catch (err: any) {
      return { success: false, error: err?.message || 'User not found' }
    }
  })

  ipcMain.handle('auth-reset-password', async (_event, { username, answer, newPassword }) => {
    try {
      await ensureCleaveServerRunning()
      const cleanUser = (username || '').trim()
      const cleanAnswer = (answer || '').trim()
      const cleanNewPass = newPassword || ''

      if (!cleanUser) {
        return { success: false, error: 'Username is required' }
      }
      if (!cleanAnswer) {
        return { success: false, error: 'Security answer is required' }
      }
      if (!cleanNewPass) {
        return { success: false, error: 'New password is required' }
      }

      const db = new CleaveDB({
        host: '127.0.0.1',
        port: 8300,
        timeoutMs: 6000
      })

      const res = await db.resetPassword({
        username: cleanUser,
        answer: cleanAnswer,
        newPassword: cleanNewPass
      })

      if (res && res.status === 'ok') {
        return { success: true, message: res.message || 'Password reset successfully!' }
      } else {
        return { success: false, error: res?.message || 'Password reset failed' }
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Invalid answer or recovery failed' }
    }
  })

  ipcMain.handle('auth-check-status', async () => {
    const running = await isServerRunning(8300)
    return { online: running }
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

app.on('will-quit', () => {
  if (cleaveProcess && !cleaveProcess.killed) {
    try {
      cleaveProcess.kill()
    } catch {}
  }
})

