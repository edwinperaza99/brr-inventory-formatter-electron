import { useState, useEffect } from 'react'
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

interface ElectronFile extends File {
  path: string
}
export default function App(): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [removeAuthor, setRemoveAuthor] = useState(false)
  const [removeLocation, setRemoveLocation] = useState(false)
  const [removeISBN, setRemoveISBN] = useState(false)
  const [removeEdition, setRemoveEdition] = useState(false)
  const [removeAvailability, setRemoveAvailability] = useState(false)
  const [initials, setInitials] = useState('')
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('removeAuthor', JSON.stringify(removeAuthor))
    localStorage.setItem('removeLocation', JSON.stringify(removeLocation))
    localStorage.setItem('removeISBN', JSON.stringify(removeISBN))
    localStorage.setItem('removeEdition', JSON.stringify(removeEdition))
    localStorage.setItem('removeAvailability', JSON.stringify(removeAvailability))
    localStorage.setItem('initials', initials)
    localStorage.setItem('endDate', date ? date.toISOString() : '')
  }, [removeAuthor, removeLocation, removeISBN, removeEdition, removeAvailability, initials, date])

  useEffect(() => {
    setRemoveAuthor(JSON.parse(localStorage.getItem('removeAuthor') || 'false'))
    setRemoveLocation(JSON.parse(localStorage.getItem('removeLocation') || 'false'))
    setRemoveISBN(JSON.parse(localStorage.getItem('removeISBN') || 'false'))
    setRemoveEdition(JSON.parse(localStorage.getItem('removeEdition') || 'false'))
    setRemoveAvailability(JSON.parse(localStorage.getItem('removeAvailability') || 'false'))
    setInitials(localStorage.getItem('initials') || '')
    const savedDate = localStorage.getItem('endDate')
    setDate(savedDate ? new Date(savedDate) : undefined)
  }, [])

  //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const uploadedFile = e.target.files?.[0] as ElectronFile | undefined
  //     if (uploadedFile) setFile(uploadedFile)
  //   }

  const handlePickFile = async (): Promise<void> => {
    if (window.electronAPI?.pickFile) {
      const selectedFilePath = await window.electronAPI.pickFile()
      if (selectedFilePath) {
        const fakeFile = {
          name: selectedFilePath.split('/').pop() || '',
          path: selectedFilePath
        } as ElectronFile
        setFile(fakeFile)
      }
    } else {
      alert('Electron API not available')
    }
  }

  const handleFileUpload = async (): Promise<void> => {
    if (!file) return

    setIsLoading(true)

    // Prepare data for main process
    const requestData = {
      filePath: (file as ElectronFile).path,
      removeAuthor,
      removeLocation,
      removeISBN,
      removeEdition,
      removeAvailability,
      initials,
      endDate: date ? format(date, 'MM/dd/yyyy') : undefined
    }

    try {
      // Use Electron IPC if available
      if (window.electronAPI) {
        const savePath = await window.electronAPI.processFile(requestData)
        if (savePath) {
          alert(`File saved successfully at:\n${savePath}`)
        } else {
          alert('File processing canceled')
        }
      } else {
        alert('Electron API not available')
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto flex flex-col justify-center items-center min-h-screen">
      <Navbar />
      <h1 className="text-center text-3xl sm:text-5xl my-5">RBR List Formatter</h1>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          handleFileUpload()
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
          <Label>Upload Excel File:</Label>
          <Button type="button" onClick={handlePickFile}>
            {file ? `Selected: ${file.name}` : 'Pick File'}
          </Button>
        </div>

        <div className="mt-4">
          <Button type="submit" disabled={!file || isLoading} className="w-full">
            {isLoading ? 'Processing...' : 'Process File'}
          </Button>
        </div>
      </form>
    </main>
  )
}
