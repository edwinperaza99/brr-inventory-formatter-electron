import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI?: {
      pickFile: () => Promise<string>
      processFile: (data: unknown) => Promise<string>
    }
  }
}
