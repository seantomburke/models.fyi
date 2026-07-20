import { renderHook, act } from '@testing-library/react'
import { useDarkMode } from './darkMode'

const STORAGE_KEY = 'models-fyi-dark-mode'

beforeEach(() => {
  // jsdom provides localStorage, but clear it to be safe
  try {
    localStorage.clear()
  } catch {
    // localStorage might not be available in some test environments
  }
  document.documentElement.classList.remove('dark')
})

afterEach(() => {
  try {
    localStorage.clear()
  } catch {
    // localStorage might not be available in some test environments
  }
  document.documentElement.classList.remove('dark')
})

test('initializes from localStorage when available', () => {
  localStorage.setItem(STORAGE_KEY, 'true')
  const { result } = renderHook(() => useDarkMode())
  expect(result.current[0]).toBe(true)
})

test('initializes to false when localStorage is false', () => {
  localStorage.setItem(STORAGE_KEY, 'false')
  const { result } = renderHook(() => useDarkMode())
  expect(result.current[0]).toBe(false)
})

test('falls back to system preference when localStorage is empty', () => {
  // Mock system preference to dark
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
    }),
  })

  const { result } = renderHook(() => useDarkMode())
  expect(result.current[0]).toBe(true)
})

test('applies dark class to document root when dark mode is enabled', () => {
  localStorage.setItem(STORAGE_KEY, 'true')
  renderHook(() => useDarkMode())
  expect(document.documentElement.classList.contains('dark')).toBe(true)
})

test('removes dark class from document root when dark mode is disabled', () => {
  localStorage.setItem(STORAGE_KEY, 'false')
  renderHook(() => useDarkMode())
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('persists preference to localStorage on change', () => {
  const { result } = renderHook(() => useDarkMode())
  expect(localStorage.getItem(STORAGE_KEY)).toBe(null)

  act(() => {
    result.current[1](true)
  })

  expect(localStorage.getItem(STORAGE_KEY)).toBe('true')

  act(() => {
    result.current[1](false)
  })

  expect(localStorage.getItem(STORAGE_KEY)).toBe('false')
})

test('updates document root class when dark mode is toggled', () => {
  const { result } = renderHook(() => useDarkMode())

  act(() => {
    result.current[1](true)
  })
  expect(document.documentElement.classList.contains('dark')).toBe(true)

  act(() => {
    result.current[1](false)
  })
  expect(document.documentElement.classList.contains('dark')).toBe(false)
})

test('keeps every hook consumer synchronized when the preference changes', () => {
  const first = renderHook(() => useDarkMode())
  const second = renderHook(() => useDarkMode())

  act(() => first.result.current[1](true))

  expect(first.result.current[0]).toBe(true)
  expect(second.result.current[0]).toBe(true)
})
