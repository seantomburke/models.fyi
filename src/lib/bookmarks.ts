const BOOKMARKS_KEY = 'models-wtf-bookmarks'

export function loadBookmarks(): Set<string> {
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY)
    return new Set(stored ? JSON.parse(stored) : [])
  } catch {
    return new Set()
  }
}

export function saveBookmarks(modelIds: Set<string>): void {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(modelIds)))
}

export function toggleBookmark(modelIds: Set<string>, modelId: string): Set<string> {
  const updated = new Set(modelIds)
  if (updated.has(modelId)) {
    updated.delete(modelId)
  } else {
    updated.add(modelId)
  }
  return updated
}

export function isBookmarked(modelIds: Set<string>, modelId: string): boolean {
  return modelIds.has(modelId)
}
