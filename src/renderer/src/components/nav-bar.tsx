import { AppInfoDialog } from '@renderer/components/app-info-dialog'
import { ModeToggle } from '@renderer/components/toggle-theme-button'

export default function Navbar(): React.JSX.Element {
  return (
    <nav className="absolute top-5 right-5 max-w-screen-2xl flex gap-2  justify-end">
      <AppInfoDialog />
      <ModeToggle />
    </nav>
  )
}
