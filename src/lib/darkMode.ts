import { useCallback, useEffect, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'models-wtf-dark-mode'
const CHANGE_EVENT = 'models-wtf-dark-mode-change'
const QUERY = '(prefers-color-scheme: dark)'

function getSnapshot() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === null ? window.matchMedia(QUERY).matches : stored === 'true'
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY)
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange()
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onStorage)
  media.addEventListener('change', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onStorage)
    media.removeEventListener('change', onChange)
  }
}

/**
 * Custom hook for managing dark mode preference
 * Reads from localStorage, falls back to system preference, and persists changes
 */
export function useDarkMode(): [isDark: boolean, setIsDark: (value: boolean) => void] {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, () => false)

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
  const setIsDark = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return [isDark, setIsDark]
}
