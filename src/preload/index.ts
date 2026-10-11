import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  minimizeWindow: (): void => {
    ipcRenderer.send('window-minimize')
  },
  maximizeWindow: (): void => {
    ipcRenderer.send('window-maximize')
  },
  closeWindow: (): void => {
    ipcRenderer.send('window-close')
  },
  isMaximized: (): Promise<boolean> => {
    return ipcRenderer.invoke('window-is-maximized')
  },
  maximizeWindowSmooth: (): Promise<boolean> => {
    return ipcRenderer.invoke('window-maximize-smooth')
  },
  restoreWindowSmooth: (): Promise<boolean> => {
    return ipcRenderer.invoke('window-restore-smooth')
  },
  getSystemStorage: (): Promise<{ totalGB: number; freeGB: number; usedGB: number; percentUsed: number; drive: string }> => {
    return ipcRenderer.invoke('get-system-storage')
  },
  onMaximizeChange: (callback: (isMaximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean): void => {
      callback(isMaximized)
    }
    ipcRenderer.on('window-maximize-change', handler)
    return (): void => {
      ipcRenderer.removeListener('window-maximize-change', handler)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
