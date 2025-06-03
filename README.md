# RBR Inventory Formatter (Desktop)

**RBR Inventory Formatter (Desktop)** is a native desktop application designed to streamline inventory management workflows at the Pollak Library circulation desk. Built with **Electron**, **React**, **TypeScript**, and **TailwindCSS**, this app processes `.xls` files exported from the Alma library system—removing unnecessary columns, adding custom fields (like user initials and processing dates), and preparing them for printing.

This native version delivers the same core functionality as the web app but with improved performance and full offline capabilities.

---

## 🚀 Key Features

- **Native Experience:** Built with Electron for cross-platform desktop support (macOS, Windows, Linux).
- **Column Management:** Remove unnecessary fields like "Author," "Location," and "ISBN/ISSN" based on user preference.
- **Custom Fields:** Add user initials, inventory date, and checkmarks automatically to each entry.
- **Excel File Handling:** Processes `.xls` input and outputs a fully formatted `.xlsx` file.
- **Local Preferences:** Stores user settings (columns to remove, initials, etc.) for seamless repeated use.
- **Theming Support:** Light and dark mode via Tailwind and custom theming.

---

## 🛠️ Tech Stack

- [Electron](https://www.electronjs.org/) – for building the desktop app.
- [electron-vite](https://electron-vite.org/) – Vite-based tooling for fast development.
- [React](https://reactjs.org/) – UI library for component-based development.
- [TypeScript](https://www.typescriptlang.org/) – strongly typed JavaScript.
- [TailwindCSS](https://tailwindcss.com/) – utility-first styling framework.
- [shadcn/ui](https://ui.shadcn.dev/) – accessible UI components based on Radix UI and Tailwind.
- [ExcelJS](https://github.com/exceljs/exceljs) – to read/write `.xlsx` files.
- [date-fns](https://date-fns.org/) – date manipulation and formatting.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) – for saving files locally.

---

## 🖥️ How to Use

1. Launch the desktop app.
2. Upload an `.xls` file exported from the Alma system.
3. Select which columns you want to remove.
4. Enter your initials and inventory date (optional).
5. Click **Process File** to generate the new `.xlsx` file.
6. Download and print the formatted output.

---

## 📦 Installation

For download and installation instructions, visit the website for the web version:

👉 [https://rbr-inventory-formatter.edwinperaza.com/](https://rbr-inventory-formatter.edwinperaza.com/)

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
