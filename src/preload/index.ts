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
  },
  auth: {
    login: (credentials: { username: string; password: string }): Promise<{ success: boolean; username?: string; error?: string }> => {
      return ipcRenderer.invoke('auth-login', credentials)
    },
    register: (data: {
      username: string
      password: string
      devPassword?: string
      question: string
      answer: string
    }): Promise<{ success: boolean; message?: string; error?: string }> => {
      return ipcRenderer.invoke('auth-register', data)
    },
    getSecurityQuestion: (username: string): Promise<{ success: boolean; question?: string; error?: string }> => {
      return ipcRenderer.invoke('auth-get-security-question', { username })
    },
    resetPassword: (data: {
      username: string
      answer: string
      newPassword: string
    }): Promise<{ success: boolean; message?: string; error?: string }> => {
      return ipcRenderer.invoke('auth-reset-password', data)
    },
    checkStatus: (): Promise<{ online: boolean }> => {
      return ipcRenderer.invoke('auth-check-status')
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
