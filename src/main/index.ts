import icon from '../../resources/icon.png?asset'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import ExcelJS, { BorderStyle } from 'exceljs'
import fs from 'fs'
import { join } from 'path'
import * as XLSX from 'xlsx'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    title: 'RBR Inventory Formatter',
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
  const endDate = options.endDate
  const initials = options.initials || ''

  if (!filePath) {
    throw new Error('No filePath provided.')
  }

  try {
    // Read the Excel file
    console.log('Reading file:', filePath)
    const buffer = fs.readFileSync(filePath)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    // const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const xlsxBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer'
    })

    // Step 2: Load .xlsx into ExcelJS for further processing
    const excelWorkbook = new ExcelJS.Workbook()
    await excelWorkbook.xlsx.load(xlsxBuffer)
    const worksheet = excelWorkbook.worksheets[0]

    // **Set Workbook Metadata** (Creator, created date, modified date)
    excelWorkbook.creator = 'Edwin Peraza'
    excelWorkbook.created = new Date()
    excelWorkbook.modified = new Date()

    // **Define Default Row and Column Heights**
    worksheet.properties.defaultRowHeight = 15
    worksheet.properties.defaultColWidth = 10

    // **Set Worksheet Views and Page Setup**
    worksheet.views = [{ state: 'normal' }]
    worksheet.pageSetup = {
      orientation: 'landscape'
      // fitToPage: true,
      // fitToWidth: 1,
      // fitToHeight: 0,
    }

    // **Add New Columns for Inventory at the End of Existing Columns Before Deletion**
    const lastColumnIndex = worksheet.columns.length + 1

    // Add headers for "Inventory Date," "Checkmark," and "Initials" at the end
    worksheet.getRow(1).getCell(lastColumnIndex).value = 'Inventory Date'
    worksheet.getRow(1).getCell(lastColumnIndex + 1).value = '✓'
    worksheet.getRow(1).getCell(lastColumnIndex + 2).value = 'Initials'

    // Get current date in MM/DD/YYYY format for "Inventory Date"
    const currentDate = new Date()
    const formattedDate = `${
      currentDate.getMonth() + 1
    }/${currentDate.getDate()}/${currentDate.getFullYear()}`

    // Populate only the first row of the new columns
    worksheet.getRow(2).getCell(lastColumnIndex).value = formattedDate
    worksheet.getRow(2).getCell(lastColumnIndex).alignment = {
      horizontal: 'center',
      vertical: 'middle'
    }
    worksheet.getRow(2).getCell(lastColumnIndex + 1).value = '✓'
    worksheet.getRow(2).getCell(lastColumnIndex + 1).alignment = {
      horizontal: 'center',
      vertical: 'middle'
    }
    const defaultInitials = options.initials || ''
    worksheet.getRow(2).getCell(lastColumnIndex + 2).value = defaultInitials
    worksheet.getRow(2).getCell(lastColumnIndex + 2).alignment = {
      horizontal: 'center',
      vertical: 'middle'
    }

    // **Add 15 Extra Rows with "tempValue" for Manual Entries**
    const startRow = 3 // Start after the last populated row
    const endRow = 15 // Add up to 15 rows

    for (let i = startRow; i <= endRow; i++) {
      // Insert "tempValue" in cells to apply the border style
      worksheet.getRow(i).getCell(lastColumnIndex).value = 'tempValue' // "Inventory Date" column
      worksheet.getRow(i).getCell(lastColumnIndex + 1).value = 'tempValue' // "Checkmark" column
      worksheet.getRow(i).getCell(lastColumnIndex + 2).value = 'tempValue' // "Initials" column
    }

    // **Column Deletion and Other Processing Steps**
    const columnsToDelete = ['Imprint', 'Digital Availability', 'Electronic Availability']

    // Remove columns based on toggle states
    if (options.removeAuthor) columnsToDelete.push('Author')
    if (options.removeLocation) columnsToDelete.push('Location')
    if (options.removeISBN) columnsToDelete.push('ISBN/ISSN')
    if (options.removeEdition) columnsToDelete.push('Edition')
    if (options.removeAvailability) columnsToDelete.push('Availability')

    const headerRow = worksheet.getRow(1)

    const columnsIndicesToDelete: number[] = []
    headerRow.eachCell((cell, colNumber) => {
      if (columnsToDelete.includes(cell.value as string)) {
        columnsIndicesToDelete.push(colNumber)
      }
    })

    // Delete columns by their indices, starting from the last to avoid shifting issues
    columnsIndicesToDelete.sort((a, b) => b - a)
    columnsIndicesToDelete.forEach((colIndex) => {
      worksheet.spliceColumns(colIndex, 1)
    })

    // **Add Blank Rows at the Top**
    worksheet.insertRow(1, [])
    worksheet.insertRow(1, [])

    // Enable wrap text for all columns
    worksheet.columns.forEach((column) => {
      column.alignment = { wrapText: true }
    })

    // Enable wrap text for the first two rows
    worksheet.getRow(1).alignment = { wrapText: false }
    worksheet.getRow(2).alignment = { wrapText: false }

    // **Bold Formatting for the First Three Rows**
    for (let i = 1; i <= 3; i++) {
      worksheet.getRow(i).font = { bold: true, name: 'Arial', size: 11 }
    }

    // **Define Border Style**
    const borderStyle: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' as BorderStyle },
      left: { style: 'thin' as BorderStyle },
      bottom: { style: 'thin' as BorderStyle },
      right: { style: 'thin' as BorderStyle }
    }

    const defaultFont = { name: 'Arial', size: 10 }
    // **Set Font for the Entire Document to Arial 11**
    worksheet.eachRow((row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (row.number === 3) {
          cell.font = { bold: true, name: 'Arial', size: 11 }
        } else {
          cell.font = defaultFont
        }
        if (cell.value) {
          cell.border = borderStyle
          // Clear "tempValue" after applying border
          if (cell.value === 'tempValue') {
            cell.value = '' // Clear the cell content
          }
        }
      })
    })

    // add end date message
    if (endDate) {
      const initialsColumnHeader = 'Initials'

      // Find the index of the "Initials" column by searching the first row
      const headerRow = worksheet.getRow(3)
      let initialsColumnIndex: number | undefined

      headerRow.eachCell((cell, colNumber) => {
        if (cell.value === initialsColumnHeader) {
          initialsColumnIndex = colNumber
        }
      })

      if (initialsColumnIndex) {
        const message = `End date updated to ${endDate} - ${initials || ''}`
        worksheet.getRow(1).getCell(initialsColumnIndex).value = message
        worksheet.getRow(1).getCell(initialsColumnIndex).alignment = {
          horizontal: 'right'
        }
      }
    }

    // **Clear Header/Footer to Avoid Extra Print Page**
    worksheet.headerFooter = {
      oddHeader: '', // Clear header for odd pages
      oddFooter: '', // Clear footer for odd pages
      evenHeader: '', // Clear header for even pages, if duplex printing
      evenFooter: '' // Clear footer for even pages, if duplex printing
    }

    // **Auto-Fit Columns for Printing**
    const columns = worksheet.columns as ExcelJS.Column[] | undefined
    if (columns) {
      columns.forEach((column) => {
        let maxLength = 5 // Default width
        if (column) {
          column.eachCell({ includeEmpty: true }, (cell) => {
            if (cell.value) {
              const length = cell.value.toString().length
              if (length > maxLength) maxLength = length
            }
          })
          column.width = maxLength
        }
      })
    } else {
      console.warn('Worksheet columns are undefined.')
    }
    // END OF PROCESSING STEPS

    // Show save dialog
    const { filePath: savePath } = await dialog.showSaveDialog({
      title: 'Save Processed File',
      defaultPath: 'ProcessedFile.xlsx',
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    })

    if (!savePath) return null // User canceled

    // Write as XLSX
    const xlsxBufferFinal = await excelWorkbook.xlsx.writeBuffer()
    fs.writeFileSync(savePath, Buffer.from(xlsxBufferFinal))
    console.log('File saved successfully:', savePath)
    // XLSX.writeFile(workbook, savePath)
    return savePath
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to process file: ${message}`)
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
