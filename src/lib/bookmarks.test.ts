import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadBookmarks, saveBookmarks, toggleBookmark, isBookmarked } from './bookmarks'

describe('bookmarks', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('loads empty set when no bookmarks exist', () => {
    const bookmarks = loadBookmarks()
    expect(bookmarks).toEqual(new Set())
  })

  it('saves bookmarks to localStorage', () => {
    const bookmarks = new Set(['model-1', 'model-2'])
    saveBookmarks(bookmarks)

    const stored = JSON.parse(localStorage.getItem('models-wtf-bookmarks') || '[]')
    expect(stored).toContain('model-1')
    expect(stored).toContain('model-2')
  })

  it('loads bookmarks from localStorage', () => {
    localStorage.setItem('models-wtf-bookmarks', JSON.stringify(['model-1', 'model-2']))
    const bookmarks = loadBookmarks()

    expect(bookmarks.has('model-1')).toBe(true)
    expect(bookmarks.has('model-2')).toBe(true)
    expect(bookmarks.size).toBe(2)
  })

  it('toggles bookmark on (add)', () => {
    const bookmarks = new Set<string>()
    const updated = toggleBookmark(bookmarks, 'model-1')

    expect(updated.has('model-1')).toBe(true)
    expect(bookmarks.has('model-1')).toBe(false) // Original unchanged
  })

  it('toggles bookmark off (remove)', () => {
    const bookmarks = new Set(['model-1'])
    const updated = toggleBookmark(bookmarks, 'model-1')

    expect(updated.has('model-1')).toBe(false)
    expect(bookmarks.has('model-1')).toBe(true) // Original unchanged
  })

  it('checks if model is bookmarked', () => {
    const bookmarks = new Set(['model-1', 'model-2'])

    expect(isBookmarked(bookmarks, 'model-1')).toBe(true)
    expect(isBookmarked(bookmarks, 'model-3')).toBe(false)
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('models-wtf-bookmarks', 'invalid json')
    const bookmarks = loadBookmarks()

    expect(bookmarks).toEqual(new Set())
  })
})
