import { useState, useEffect } from 'react'

const STORAGE_KEY = 'models-fyi-dark-mode'

/**
 * Custom hook for managing dark mode preference
 * Reads from localStorage, falls back to system preference, and persists changes
 */
export function useDarkMode(): [isDark: boolean, setIsDark: (value: boolean) => void] {
  const [isDark, setIsDarkState] = useState<boolean>(() => {
    // Check localStorage first
    if (typeof window === 'undefined') return false

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      return stored === 'true'
    }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply dark class to document root whenever isDark changes
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  // Persist to localStorage on change
  const setIsDark = (value: boolean) => {
    setIsDarkState(value)
    localStorage.setItem(STORAGE_KEY, String(value))
  }

  return [isDark, setIsDark]
}
