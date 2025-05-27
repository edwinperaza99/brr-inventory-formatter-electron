import { useState } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import Navbar from '@renderer/components/nav-bar'
import { Button } from '@renderer/components/ui/button'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
import { Input } from '@renderer/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@renderer/components/ui/popover'
import { Calendar } from '@renderer/components/ui/calendar'
import { cn } from '@renderer/lib/utils'

export default function App(): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [removeAuthor, setRemoveAuthor] = useState(false)
  const [removeLocation, setRemoveLocation] = useState(false)
  const [removeISBN, setRemoveISBN] = useState(false)
  const [removeEdition, setRemoveEdition] = useState(false)
  const [removeAvailability, setRemoveAvailability] = useState(false)
  const [initials, setInitials] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Handle Excel processing
  function handleExcelProcess() {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      if (json.length === 0) return

      const headers = json[0]
      const body = json.slice(1)

      const removeCols: string[] = []
      if (removeAuthor) removeCols.push('Author')
      if (removeLocation) removeCols.push('Location')
      if (removeISBN) removeCols.push('ISBN/ISSN')
      if (removeEdition) removeCols.push('Edition')
      if (removeAvailability) removeCols.push('Availability')

      const indicesToRemove = headers
        .map((h, i) => (removeCols.includes(h as string) ? i : -1))
        .filter((i) => i !== -1)

      const newHeaders = headers.filter((_, i) => !indicesToRemove.includes(i))
      const newBody = body.map((row) => row.filter((_, i) => !indicesToRemove.includes(i)))
      const newData = [newHeaders, ...newBody]

      // Create a new sheet
      const newSheet = XLSX.utils.aoa_to_sheet(newData)
      const newWorkbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Sheet1')

      // Generate filename
      const dateStr = date ? format(date, 'yyyy-MM-dd') : 'no-date'
      const fileName = `Formatted-${initials || 'no-initials'}-${dateStr}.xlsx`

      const xlsxBlob = workbook2blob(newWorkbook)
      xlsxBlob.then((blob) => {
        saveAs(blob, fileName)
      })
    }

    reader.readAsArrayBuffer(file)
  }

  // Helper to convert workbook to Blob
  function workbook2blob(workbook: XLSX.WorkBook): Promise<Blob> {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    return new Blob([wbout], { type: 'application/octet-stream' })
  }

  return (
    <main className="container mx-auto flex flex-col justify-center items-center min-h-screen">
      <Navbar />
      <h1 className="text-center text-3xl sm:text-5xl my-5">RBR List Formatter</h1>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          handleExcelProcess()
        }}
      >
        <div className="flex items-center space-x-2">
          <Switch
            id="author"
            checked={removeAuthor}
            onCheckedChange={(checked) => setRemoveAuthor(checked)}
          />
          <Label htmlFor="author">Delete &quot;Author&quot; Column</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="location"
            checked={removeLocation}
            onCheckedChange={(checked) => setRemoveLocation(checked)}
          />
          <Label htmlFor="location">Delete &quot;Location&quot; Column</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isbn"
            checked={removeISBN}
            onCheckedChange={(checked) => setRemoveISBN(checked)}
          />
          <Label htmlFor="isbn">Delete &quot;ISBN/ISSN&quot; Column</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="edition"
            checked={removeEdition}
            onCheckedChange={(checked) => setRemoveEdition(checked)}
          />
          <Label htmlFor="edition">Delete &quot;Edition&quot; Column</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="availability"
            checked={removeAvailability}
            onCheckedChange={(checked) => setRemoveAvailability(checked)}
          />
          <Label htmlFor="availability">Delete &quot;Availability&quot; Column</Label>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="end-date">End Date:</Label>
          <Popover>
            <PopoverTrigger>
              <Button
                id="end-date"
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              {date && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDate(undefined)
                    localStorage.removeItem('endDate')
                  }}
                  className="w-full"
                >
                  Clear Date
                </Button>
              )}
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="initials">Initials:</Label>
          <Input
            id="initials"
            type="text"
            placeholder="This field is optional"
            className="px-4"
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="file-upload">Upload Excel File:</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null)
            }}
          />
        </div>

        <div className="mt-4">
          <Button type="submit" disabled={!file} className="w-full">
            {false ? 'Processing...' : 'Process File'}
          </Button>
        </div>
      </form>
    </main>
  )
}
