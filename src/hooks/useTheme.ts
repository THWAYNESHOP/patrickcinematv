import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light' | 'system'

const THEME_KEY = 'nexastream-theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
    return savedTheme || 'dark'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    
    return 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    
    if (resolvedTheme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
    
    localStorage.setItem(THEME_KEY, theme)
  }, [theme, resolvedTheme])

  // Listen for system theme changes when using 'system' theme
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme)
    if (newTheme === 'dark') setResolvedTheme('dark')
    else if (newTheme === 'light') setResolvedTheme('light')
    else {
      // System theme - detect current preference
      setResolvedTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
  }

  return { theme, resolvedTheme, toggleTheme, setThemeMode }
}
