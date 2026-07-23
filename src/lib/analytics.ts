import type { PostHog } from 'posthog-js'

/**
 * Deferred PostHog loading.
 *
 * The analytics SDK used to be a static import in main.tsx, which put ~230kB of
 * third-party JavaScript on the critical path: the browser had to download,
 * parse, and run it before React could mount and paint anything. Nothing on
 * screen depends on it, so it now loads after first paint.
 *
 * Two consequences to handle:
 *
 * 1. Events fired before the SDK arrives (early `$pageview`, a fast click)
 *    would otherwise vanish. `queue` records them and `flush` replays them in
 *    order once the real client is live.
 * 2. `usePostHog()` reads a client out of React context during the first
 *    render, so the provider needs *something* immediately. `stub` is that
 *    stand-in: it captures into the queue and no-ops everything else.
 *
 * We import the `slim` build deliberately: it drops surveys, product tours, and
 * the other extensions this site never calls, roughly halving the download.
 * Only `capture` is used anywhere in the app (see src/lib/posthog.ts and
 * src/lib/posthog-events.ts), so nothing else needs to survive the swap.
 */

type QueuedCapture = {
  event: string
  properties?: Record<string, unknown>
}

const queue: QueuedCapture[] = []

let client: PostHog | null = null
let loadPromise: Promise<PostHog | null> | null = null

/**
 * Stand-in client handed to PostHogProvider before the SDK finishes loading.
 *
 * Deliberately minimal: it only needs to satisfy the calls this app actually
 * makes. Anything else is cast away rather than faked, so a future feature that
 * reaches for flags or surveys fails loudly here instead of silently returning
 * a wrong answer.
 */
const stub = {
  capture(event: string, properties?: Record<string, unknown>) {
    if (client) {
      client.capture(event, properties)
      return
    }

    queue.push({ event, properties })
  },
} as unknown as PostHog

/**
 * The client to hand to PostHogProvider and to `capture` through.
 * Returns the real SDK once loaded, the queueing stub before that.
 */
export const getAnalyticsClient = (): PostHog => client ?? stub

/** Replay anything captured while the SDK was still in flight. */
const flush = (loaded: PostHog) => {
  for (const { event, properties } of queue) {
    loaded.capture(event, properties)
  }
  queue.length = 0
}

/**
 * Load and initialise PostHog. Safe to call more than once; the in-flight
 * promise is reused, so concurrent callers share one network request.
 *
 * Resolves to `null` when analytics can't or shouldn't run (no token
 * configured, server-side render, or the chunk failed to load). Callers keep
 * working against the stub in that case; analytics is never load-bearing.
 */
export const loadAnalytics = async (): Promise<PostHog | null> => {
  if (client) return client
  if (loadPromise) return loadPromise

  const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN
  if (!token || typeof window === 'undefined') return null

  loadPromise = import('posthog-js/dist/module.slim')
    .then((mod) => {
      // The slim and full builds ship separate but structurally identical
      // declarations, so TypeScript treats their `PostHog` types as unrelated.
      // `@posthog/react` is typed against the full build, so we settle on that
      // type here; the runtime object is the same shape either way.
      const posthog = mod.posthog as unknown as PostHog

      posthog.init(token, {
        api_host: import.meta.env.VITE_POSTHOG_HOST,
        defaults: '2026-05-30',
        // Let the SDK own SPA pageviews. Capturing them in a React effect as
        // well records each navigation twice once history-change support is on.
        capture_pageview: 'history_change',
        capture_pageleave: true,
        disable_session_recording: false,
        // Autocapture complements the explicit funnel events in page handlers.
        // It is limited to named interactive elements so selectors stay stable
        // and text typed into the site never becomes analytics data.
        autocapture: {
          css_selector_allowlist: ['[data-attr]'],
          css_selector_ignorelist: ['.ph-no-capture', '[data-ph-no-autocapture]', '[data-ph-no-capture]'],
          element_attribute_ignorelist: ['aria-label', 'name', 'placeholder', 'value'],
          capture_copied_text: false,
        },
        mask_all_text: true,
        mask_personal_data_properties: true,
        custom_personal_data_properties: ['query', 'search', 'q'],
        debug: import.meta.env.DEV,
      })

      client = posthog
      flush(posthog)
      return posthog
    })
    .catch(() => {
      // An ad blocker or a flaky network shouldn't break the page. Drop the
      // queued events and let every later capture no-op against the stub.
      queue.length = 0
      return null
    })

  return loadPromise
}

/**
 * Capture an event, whether or not the SDK has loaded yet.
 * Prefer this over importing `posthog-js` directly.
 */
export const capture = (event: string, properties?: Record<string, unknown>) => {
  getAnalyticsClient().capture(event, properties)
}
