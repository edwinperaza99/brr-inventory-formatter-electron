import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronAPI?: {
      pickFile: () => Promise<string>
      processFile: (data: unknown) => Promise<string>
      saveSettings: (data: {
        removeAuthor: boolean
        removeLocation: boolean
        removeISBN: boolean
        removeEdition: boolean
        removeAvailability: boolean
        initials: string
        endDate?: string
      }) => Promise<void>

      getSettings: () => Promise<{
        removeAuthor: boolean
        removeLocation: boolean
        removeISBN: boolean
        removeEdition: boolean
        removeAvailability: boolean
        initials: string
        endDate?: string
      }>
    }
  }
}
