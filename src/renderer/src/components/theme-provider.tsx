import { type Theme, ThemeContext } from '@renderer/components/theme-context'
import React, { useEffect, useState } from 'react'

export function ThemeProvider({
  children,
  defaultTheme = 'system'
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  const applyTheme = (themeToApply: Theme) => {
    if (themeToApply === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (themeToApply === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isSystemDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || defaultTheme
    setThemeState(savedTheme)
    applyTheme(savedTheme)

    if (savedTheme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyTheme('system')
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [defaultTheme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
