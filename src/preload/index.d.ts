import { ElectronAPI } from '@electron-toolkit/preload'

export interface AuthAPI {
  login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; username?: string; error?: string }>
  register: (data: {
    username: string
    password: string
    devPassword?: string
    question: string
    answer: string
  }) => Promise<{ success: boolean; message?: string; error?: string }>
  getSecurityQuestion: (username: string) => Promise<{ success: boolean; question?: string; error?: string }>
  resetPassword: (data: {
    username: string
    answer: string
    newPassword: string
  }) => Promise<{ success: boolean; message?: string; error?: string }>
  checkStatus: () => Promise<{ online: boolean }>
}

export interface WindowControlAPI {
  minimizeWindow: () => void
  maximizeWindow: () => void
  closeWindow: () => void
  isMaximized: () => Promise<boolean>
  maximizeWindowSmooth: () => Promise<boolean>
  restoreWindowSmooth: () => Promise<boolean>
  getSystemStorage: () => Promise<{ totalGB: number; freeGB: number; usedGB: number; percentUsed: number; drive: string }>
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void
  auth: AuthAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: WindowControlAPI
  }
}
