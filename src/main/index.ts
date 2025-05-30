import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const path = require('path')
const fs = require('fs')
const XLSX = require('xlsx')

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

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

// Handle the 'process-file' event
ipcMain.handle('process-file', async (_, data) => {
  console.log('Received data in main process:', data)
  const { filePath, ...options } = data

  if (!filePath) {
    throw new Error('No filePath provided.')
  }

  try {
    // Read the Excel file
    const buffer = fs.readFileSync(filePath)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    // Process workbook based on options
    const deleteColumn = (sheet: any, colName: string) => {
      const range = XLSX.utils.decode_range(sheet['!ref'])
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c })
        if (sheet[cellAddress]?.v === colName) {
          XLSX.utils.sheet_delete_col(sheet, c)
          break
        }
      }
    }

    if (options.removeAuthor) deleteColumn(sheet, 'Author')
    if (options.removeLocation) deleteColumn(sheet, 'Location')
    if (options.removeISBN) deleteColumn(sheet, 'ISBN/ISSN')
    if (options.removeEdition) deleteColumn(sheet, 'Edition')
    if (options.removeAvailability) deleteColumn(sheet, 'Availability')

    // Add metadata
    if (options.initials || options.endDate) {
      const range = XLSX.utils.decode_range(sheet['!ref'])
      const newRow = range.e.r + 2
      if (options.endDate) {
        sheet[XLSX.utils.encode_cell({ r: newRow, c: 0 })] = { t: 's', v: 'End Date' }
        sheet[XLSX.utils.encode_cell({ r: newRow, c: 1 })] = { t: 's', v: options.endDate }
      }
      if (options.initials) {
        sheet[XLSX.utils.encode_cell({ r: newRow + 1, c: 0 })] = { t: 's', v: 'Initials' }
        sheet[XLSX.utils.encode_cell({ r: newRow + 1, c: 1 })] = { t: 's', v: options.initials }
      }
      sheet['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: newRow + 1, c: range.e.c }
      })
    }

    // Show save dialog
    const { filePath: savePath } = await dialog.showSaveDialog({
      title: 'Save Processed File',
      defaultPath: 'ProcessedFile.xlsx',
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    })

    if (!savePath) return null // User canceled

    // Write as XLSX
    XLSX.writeFile(workbook, savePath)
    return savePath
  } catch (error) {
    throw new Error(`Failed to process file: ${error.message}`)
  }
})

ipcMain.handle('pick-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Excel Files', extensions: ['xls', 'xlsx'] }]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0] // return path
  }
  return null
})
