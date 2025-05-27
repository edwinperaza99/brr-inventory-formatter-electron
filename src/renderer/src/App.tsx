import Navbar from '@renderer/components/nav-bar'

function App(): React.JSX.Element {
  return (
    <>
      <main className="container mx-auto flex flex-col justify-center items-center min-h-screen">
        <Navbar />
        <h1 className="text-center text-3xl sm:text-5xl my-5">RBR List Formatter</h1>
        {/* <form
					className="space-y-3"
					onSubmit={(e) => {
						e.preventDefault(); // Prevents default form submission
						handleFileUpload(); // Calls your custom upload function
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
							id="ISBN/ISSN"
							checked={removeISBN}
							onCheckedChange={(checked) => setRemoveISBN(checked)}
						/>
						<Label htmlFor="ISBN/ISSN">
							Delete &quot;ISBN/ISSN&quot; Column
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							id="Edition"
							checked={removeEdition}
							onCheckedChange={(checked) => setRemoveEdition(checked)}
						/>
						<Label htmlFor="Edition">Delete &quot;Edition&quot; Column</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							id="Availability"
							checked={removeAvailability}
							onCheckedChange={(checked) => setRemoveAvailability(checked)}
						/>
						<Label htmlFor="Availability">
							Delete &quot;Availability&quot; Column
						</Label>
					</div>
					<div className="flex flex-col gap-1">
						<Label htmlFor="end-date">End Date:</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									id="end-date"
									variant={"outline"}
									className={cn(
										"w-[280px] justify-start text-left font-normal",
										!date && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date ? format(date, "PPP") : <span>Pick a date</span>}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0">
								{date && (
									<Button
										variant="secondary"
										onClick={() => {
											setDate(undefined); // Clear the date state
											localStorage.removeItem("endDate"); // Remove the date from localStorage
										}}
										className="w-full"
									>
										Clear Date
									</Button>
								)}
								<Calendar
									mode="single"
									selected={date}
									onSelect={setDate}
									initialFocus
								/>
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
							accept=".xls"
							onChange={handleFileChange}
						/>
					</div>
					<div className="mt-4">
						<Button type="submit" disabled={!file || isLoading}>
							{isLoading ? "Processing..." : "Process File"}
						</Button>
					</div>
				</form> */}
      </main>
    </>
  )
}

export default App
