import { describe, test, expect, beforeEach, vi } from 'vitest'
import { createDefaultShortcuts } from './keyboard-shortcuts'

describe('keyboard-shortcuts', () => {
  describe('createDefaultShortcuts', () => {
    let callbacks: ReturnType<typeof createMockCallbacks>

    beforeEach(() => {
      callbacks = createMockCallbacks()
    })

    function createMockCallbacks() {
      return {
        showHelp: vi.fn(),
        showSearch: vi.fn(),
        goToCompare: vi.fn(),
        goToGraph: vi.fn(),
        goToCalculator: vi.fn(),
        goToQuiz: vi.fn(),
        goToLearn: vi.fn(),
        goToFAQ: vi.fn(),
        toggleExport: vi.fn(),
        toggleDarkMode: vi.fn(),
      }
    }

    test('creates default shortcuts array', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      expect(shortcuts).toHaveLength(10)
    })

    test('includes help shortcut with ? key', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const helpShortcut = shortcuts.find((s) => s.id === 'help')
      expect(helpShortcut).toBeDefined()
      expect(helpShortcut?.keys).toEqual(['?'])
      expect(helpShortcut?.label).toBe('?')
    })

    test('includes search shortcut with / key', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const searchShortcut = shortcuts.find((s) => s.id === 'search')
      expect(searchShortcut).toBeDefined()
      expect(searchShortcut?.keys).toEqual(['/'])
      expect(searchShortcut?.label).toBe('/')
    })

    test('includes compare shortcut with g+c chord', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const compareShortcut = shortcuts.find((s) => s.id === 'compare')
      expect(compareShortcut).toBeDefined()
      expect(compareShortcut?.keys).toEqual(['g', 'c'])
      expect(compareShortcut?.label).toBe('g c')
    })

    test('includes graph shortcut with g+g chord', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const graphShortcut = shortcuts.find((s) => s.id === 'graph')
      expect(graphShortcut).toBeDefined()
      expect(graphShortcut?.keys).toEqual(['g', 'g'])
      expect(graphShortcut?.label).toBe('g g')
    })

    test('includes calculator shortcut with g+k chord', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const calcShortcut = shortcuts.find((s) => s.id === 'calculator')
      expect(calcShortcut).toBeDefined()
      expect(calcShortcut?.keys).toEqual(['g', 'k'])
      expect(calcShortcut?.label).toBe('g k')
    })

    test('includes quiz shortcut with g+q chord', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const quizShortcut = shortcuts.find((s) => s.id === 'quiz')
      expect(quizShortcut).toBeDefined()
      expect(quizShortcut?.keys).toEqual(['g', 'q'])
      expect(quizShortcut?.label).toBe('g q')
    })

    test('includes learn shortcut with g+l chord', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const learnShortcut = shortcuts.find((s) => s.id === 'learn')
      expect(learnShortcut).toBeDefined()
      expect(learnShortcut?.keys).toEqual(['g', 'l'])
      expect(learnShortcut?.label).toBe('g l')
    })

    test('includes faq shortcut with g+f chord', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const faqShortcut = shortcuts.find((s) => s.id === 'faq')
      expect(faqShortcut).toBeDefined()
      expect(faqShortcut?.keys).toEqual(['g', 'f'])
      expect(faqShortcut?.label).toBe('g f')
    })

    test('includes export shortcut with e key', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const exportShortcut = shortcuts.find((s) => s.id === 'export')
      expect(exportShortcut).toBeDefined()
      expect(exportShortcut?.keys).toEqual(['e'])
      expect(exportShortcut?.label).toBe('e')
    })

    test('includes dark mode shortcut with d key', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const darkModeShortcut = shortcuts.find((s) => s.id === 'darkMode')
      expect(darkModeShortcut).toBeDefined()
      expect(darkModeShortcut?.keys).toEqual(['d'])
      expect(darkModeShortcut?.label).toBe('d')
    })

    test('each shortcut has all required properties', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      shortcuts.forEach((shortcut) => {
        expect(shortcut).toHaveProperty('id')
        expect(shortcut).toHaveProperty('keys')
        expect(shortcut).toHaveProperty('label')
        expect(shortcut).toHaveProperty('description')
        expect(shortcut).toHaveProperty('action')
        expect(typeof shortcut.action).toBe('function')
      })
    })

    test('help shortcut calls showHelp callback', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const helpShortcut = shortcuts.find((s) => s.id === 'help')
      helpShortcut?.action()
      expect(callbacks.showHelp).toHaveBeenCalled()
    })

    test('compare shortcut calls goToCompare callback', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const compareShortcut = shortcuts.find((s) => s.id === 'compare')
      compareShortcut?.action()
      expect(callbacks.goToCompare).toHaveBeenCalled()
    })

    test('dark mode shortcut calls toggleDarkMode callback', () => {
      const shortcuts = createDefaultShortcuts(callbacks)
      const darkModeShortcut = shortcuts.find((s) => s.id === 'darkMode')
      darkModeShortcut?.action()
      expect(callbacks.toggleDarkMode).toHaveBeenCalled()
    })
  })
})
