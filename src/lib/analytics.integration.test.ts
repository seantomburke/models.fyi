import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { gunzipSync } from 'node:zlib'

/**
 * Companion to analytics.test.ts, which stubs the SDK to test the queue in
 * isolation. This one drives the *real* slim posthog-js build end to end, so it
 * catches the failure that stubs can't: the deferred chunk loading but events
 * never actually leaving the browser.
 */

/** Every event name the SDK actually put on the wire. */
const sentEvents: string[] = []

/**
 * Pull event names out of an ingest request.
 *
 * The SDK gzips the payload and sends it as an ArrayBuffer, so this inflates
 * binary bodies first. Strings are still handled for the uncompressed path
 * (and the `data=` form encoding the SDK falls back to).
 */
const recordEvents = (body: unknown) => {
  let raw: string

  if (typeof body === 'string') {
    raw = body
  } else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    const bytes = body instanceof ArrayBuffer ? new Uint8Array(body) : new Uint8Array(body.buffer)
    try {
      raw = gunzipSync(bytes).toString('utf8')
    } catch {
      // Not gzipped after all — fall back to reading it as plain text.
      raw = Buffer.from(bytes).toString('utf8')
    }
  } else {
    return
  }

  if (raw.startsWith('data=')) raw = decodeURIComponent(raw.slice(5))

  try {
    const parsed = JSON.parse(raw)
    for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
      if (item && typeof item.event === 'string') sentEvents.push(item.event)
    }
  } catch {
    // Unexpected shape: fall back to scanning the decoded text so a payload
    // format change degrades into a weaker check rather than a crash.
    for (const match of raw.matchAll(/"event"\s*:\s*"([^"]+)"/g)) sentEvents.push(match[1])
  }
}

beforeEach(() => {
  sentEvents.length = 0
  vi.resetModules()
  vi.stubEnv('VITE_POSTHOG_PROJECT_TOKEN', 'phc_integration_test')
  vi.stubEnv('VITE_POSTHOG_HOST', 'https://us.i.posthog.com')

  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string | URL, init?: RequestInit) => {
      recordEvents(init?.body)
      return new Response('{"status":1}', { status: 200 })
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('analytics integration (real slim SDK)', () => {
  it('delivers an event captured before load to the ingest endpoint', async () => {
    const { capture, loadAnalytics } = await import('./analytics.ts')

    // Fired while the SDK is still in flight — the case that used to be a
    // guaranteed static import and is now genuinely deferred.
    capture('early_test_event', { early: true })
    expect(sentEvents).toHaveLength(0)

    const client = await loadAnalytics()
    expect(client).not.toBeNull()

    // Assert on the specific queued event, not merely that *some* request went
    // out — the SDK fires its own requests on init, which would make a looser
    // check pass even if the flush were broken.
    await vi.waitFor(
      () => {
        expect(sentEvents).toContain('early_test_event')
      },
      { timeout: 5000 },
    )
  })
})
