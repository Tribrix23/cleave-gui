import { ElectronAPI } from '@electron-toolkit/preload'

export interface WindowControlAPI {
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  isMaximized: () => Promise<boolean>
  maximizeWindowSmooth: () => Promise<boolean>
  restoreWindowSmooth: () => Promise<boolean>
  getSystemStorage: () => Promise<{ totalGB: number; freeGB: number; usedGB: number; percentUsed: number; drive: string }>
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowControlAPI
  }
}
