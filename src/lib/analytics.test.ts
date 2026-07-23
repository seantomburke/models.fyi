import { describe, it, expect, vi, beforeEach } from 'vitest'

// The slim SDK is the module under deferral. Stub it so no network or real
// PostHog init happens, and so we can assert what got captured and when.
const init = vi.fn()
const capture = vi.fn()

vi.mock('posthog-js/dist/module.slim', () => ({
  posthog: { init, capture },
}))

// analytics.ts keeps module-level state (the queue, the cached client), so each
// test needs a fresh copy rather than a shared singleton.
const freshModule = async () => {
  vi.resetModules()
  return import('./analytics.ts')
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('VITE_POSTHOG_PROJECT_TOKEN', 'test-token')
})

describe('analytics', () => {
  it('queues events captured before the SDK loads, then replays them in order', async () => {
    const { capture: track, loadAnalytics } = await freshModule()

    track('first_event', { position: 1 })
    track('second_event', { position: 2 })

    // Nothing reaches PostHog until the deferred import resolves.
    expect(capture).not.toHaveBeenCalled()

    await loadAnalytics()

    expect(capture).toHaveBeenCalledTimes(2)
    expect(capture).toHaveBeenNthCalledWith(1, 'first_event', { position: 1 })
    expect(capture).toHaveBeenNthCalledWith(2, 'second_event', { position: 2 })
  })

  it('sends events straight through once loaded', async () => {
    const { capture: track, loadAnalytics } = await freshModule()

    await loadAnalytics()
    track('later_event', { ok: true })

    expect(capture).toHaveBeenCalledExactlyOnceWith('later_event', { ok: true })
  })

  it('keeps the original provider client live after the deferred SDK loads', async () => {
    const { getAnalyticsClient, loadAnalytics } = await freshModule()
    const providerClient = getAnalyticsClient()

    providerClient.capture('before_load', { position: 1 })
    expect(capture).not.toHaveBeenCalled()

    await loadAnalytics()
    providerClient.capture('after_load', { position: 2 })

    expect(capture).toHaveBeenCalledTimes(2)
    expect(capture).toHaveBeenNthCalledWith(1, 'before_load', { position: 1 })
    expect(capture).toHaveBeenNthCalledWith(2, 'after_load', { position: 2 })
  })

  it('replays each queued event only once', async () => {
    const { capture: track, loadAnalytics } = await freshModule()

    track('queued_event')
    await loadAnalytics()
    // A second load must not re-send what the first already flushed.
    await loadAnalytics()

    expect(capture).toHaveBeenCalledExactlyOnceWith('queued_event', undefined)
  })

  it('initialises the SDK exactly once across concurrent callers', async () => {
    const { loadAnalytics } = await freshModule()

    await Promise.all([loadAnalytics(), loadAnalytics(), loadAnalytics()])

    expect(init).toHaveBeenCalledTimes(1)
    expect(init).toHaveBeenCalledWith('test-token', expect.objectContaining({
      defaults: '2026-05-30',
      capture_pageview: 'history_change',
      mask_all_text: true,
      mask_personal_data_properties: true,
      autocapture: expect.objectContaining({
        css_selector_allowlist: ['[data-attr]'],
        capture_copied_text: false,
      }),
    }))
  })

  it('skips loading when no project token is configured', async () => {
    vi.stubEnv('VITE_POSTHOG_PROJECT_TOKEN', '')
    const { loadAnalytics } = await freshModule()

    await expect(loadAnalytics()).resolves.toBeNull()
    expect(init).not.toHaveBeenCalled()
  })

  it('keeps capture() safe to call when the SDK never loads', async () => {
    vi.stubEnv('VITE_POSTHOG_PROJECT_TOKEN', '')
    const { capture: track, loadAnalytics } = await freshModule()

    await loadAnalytics()

    // An ad blocker or missing config must not turn a tracked click into a crash.
    expect(() => track('event_without_sdk')).not.toThrow()
    expect(capture).not.toHaveBeenCalled()
  })

  it('keeps the original provider client safe when SDK initialisation fails', async () => {
    init.mockImplementationOnce(() => {
      throw new Error('blocked SDK')
    })
    const { getAnalyticsClient, loadAnalytics } = await freshModule()
    const providerClient = getAnalyticsClient()

    providerClient.capture('before_failed_load')
    await expect(loadAnalytics()).resolves.toBeNull()

    expect(() => providerClient.capture('after_failed_load')).not.toThrow()
    expect(capture).not.toHaveBeenCalled()
  })

  it('exposes a usable client for PostHogProvider before the SDK arrives', async () => {
    const { getAnalyticsClient } = await freshModule()

    // PostHogProvider reads this during the very first render, so it can never
    // be null; components call usePostHog().capture() immediately.
    expect(() => getAnalyticsClient().capture('from_stub')).not.toThrow()
  })
})
