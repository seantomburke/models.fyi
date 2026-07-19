/**
 * Keyboard shortcuts for power users
 * Supports single-key shortcuts (?, /, e, d) and chord shortcuts (g+c, g+g, g+k, g+q, g+l)
 */

import React from 'react'

export interface Shortcut {
  id: string
  keys: string[] // For single keys: [key], for chords: ['g', 'c']
  label: string
  description: string
  action: () => void
}

export interface KeyboardShortcutsConfig {
  enabled: boolean
  shortcuts: Shortcut[]
}

/**
 * Hook to listen for and handle keyboard shortcuts
 * Returns current chord state and list of available shortcuts
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const [currentChord, setCurrentChord] = React.useState<string[]>([])
  const chordTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Clear chord state after 2 seconds of inactivity
  const resetChord = React.useCallback(() => {
    setCurrentChord([])
    if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current)
  }, [])

  const handleKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      // Ignore if focused on input/textarea. The target can also be the
      // document or window itself, which has none of these accessors.
      const target = event.target
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true')
      ) {
        return
      }

      // Ignore if Ctrl/Cmd/Alt is pressed (reserved for OS/browser shortcuts)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      const key = event.key.toLowerCase()

      // Only handle printable single-character keys
      if (key.length !== 1) {
        return
      }

      // Shifted letters (Shift+D) aren't shortcuts, but shifted punctuation
      // like '?' is — event.key already reflects the produced character.
      if (event.shiftKey && /[a-z]/.test(key)) {
        return
      }

      // Check for single-key shortcuts first
      const singleKeyShortcut = shortcuts.find(
        (s) => s.keys.length === 1 && s.keys[0] === key,
      )
      if (singleKeyShortcut) {
        event.preventDefault()
        singleKeyShortcut.action()
        resetChord()
        return
      }

      // Handle chord shortcuts (e.g., g+c)
      const newChord = [...currentChord, key]

      // Check if the new chord matches any shortcuts
      const chordShortcut = shortcuts.find(
        (s) =>
          s.keys.length === newChord.length &&
          s.keys.every((k, i) => k === newChord[i]),
      )

      if (chordShortcut) {
        event.preventDefault()
        chordShortcut.action()
        resetChord()
        return
      }

      // Keys that neither match a shortcut nor start a chord must keep their
      // default behavior — e.g. Space still scrolls the page.
      const startsChord = shortcuts.some(
        (s) =>
          s.keys.length > newChord.length &&
          newChord.every((k, i) => k === s.keys[i]),
      )
      if (!startsChord) {
        resetChord()
        return
      }

      event.preventDefault()
      setCurrentChord(newChord)

      // Clear chord after 2 seconds of inactivity
      if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current)
      chordTimeoutRef.current = setTimeout(() => {
        resetChord()
      }, 2000)
    },
    [shortcuts, currentChord, resetChord],
  )

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current)
    }
  }, [handleKeyDown])

  return { currentChord, shortcuts }
}

/**
 * Default keyboard shortcuts for the application
 * Should be populated by App.tsx with action callbacks
 */
export const createDefaultShortcuts = (callbacks: {
  showHelp: () => void
  showSearch: () => void
  goToCompare: () => void
  goToGraph: () => void
  goToCalculator: () => void
  goToQuiz: () => void
  goToLearn: () => void
  goToFAQ: () => void
  toggleExport: () => void
  toggleDarkMode: () => void
}): Shortcut[] => [
  {
    id: 'help',
    keys: ['?'],
    label: '?',
    description: 'Show keyboard shortcuts',
    action: callbacks.showHelp,
  },
  {
    id: 'search',
    keys: ['/'],
    label: '/',
    description: 'Focus search',
    action: callbacks.showSearch,
  },
  {
    id: 'compare',
    keys: ['g', 'c'],
    label: 'g c',
    description: 'Go to Compare',
    action: callbacks.goToCompare,
  },
  {
    id: 'graph',
    keys: ['g', 'g'],
    label: 'g g',
    description: 'Go to Graph',
    action: callbacks.goToGraph,
  },
  {
    id: 'calculator',
    keys: ['g', 'k'],
    label: 'g k',
    description: 'Go to Calculator',
    action: callbacks.goToCalculator,
  },
  {
    id: 'quiz',
    keys: ['g', 'q'],
    label: 'g q',
    description: 'Go to Which model?',
    action: callbacks.goToQuiz,
  },
  {
    id: 'learn',
    keys: ['g', 'l'],
    label: 'g l',
    description: 'Go to Learn',
    action: callbacks.goToLearn,
  },
  {
    id: 'faq',
    keys: ['g', 'f'],
    label: 'g f',
    description: 'Go to FAQ',
    action: callbacks.goToFAQ,
  },
  {
    id: 'export',
    keys: ['e'],
    label: 'e',
    description: 'Export comparison',
    action: callbacks.toggleExport,
  },
  {
    id: 'darkMode',
    keys: ['d'],
    label: 'd',
    description: 'Toggle dark mode',
    action: callbacks.toggleDarkMode,
  },
]
