const VIEW_MODE_KEY = 'models-wtf-view-mode'

/** Below this viewport width the card layout is the friendlier default. */
export const MOBILE_BREAKPOINT = 768

export type ViewMode = 'table' | 'cards'

export function defaultViewMode(viewportWidth: number): ViewMode {
  return viewportWidth < MOBILE_BREAKPOINT ? 'cards' : 'table'
}

export function loadViewMode(viewportWidth: number): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY)
    if (stored === 'table' || stored === 'cards') {
      return stored
    }
  } catch {
    // localStorage unavailable (private browsing, blocked); fall through to default
  }
  return defaultViewMode(viewportWidth)
}

export function saveViewMode(mode: ViewMode): void {
  localStorage.setItem(VIEW_MODE_KEY, mode)
}
