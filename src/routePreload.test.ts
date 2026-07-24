import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createRetryableRouteLoader,
  isStaleChunkError,
  preloadInitialRoute,
  routeLoaderFor,
  routeLoaders,
} from './routePreload.ts'

describe('route preloading', () => {
  it.each([
    ['/models.wtf/compare/', routeLoaders.compare],
    ['/models.wtf/learn/what-is-an-llm/', routeLoaders.learnTopic],
    ['/models.wtf/models/claude-sonnet-5/', routeLoaders.modelDetail],
    ['/models.wtf/missing/', routeLoaders.notFound],
  ])('selects the initial chunk for %s', (pathname, expected) => {
    expect(routeLoaderFor(pathname, '/models.wtf/')).toBe(expected)
  })

  it('does not delay the eagerly loaded home page', async () => {
    expect(routeLoaderFor('/models.wtf/', '/models.wtf/')).toBeUndefined()
    await expect(preloadInitialRoute('/models.wtf/', '/models.wtf/')).resolves.toBeUndefined()
  })

  it('loads a direct-entry route before the app mounts', async () => {
    await expect(preloadInitialRoute('/models.wtf/faq/', '/models.wtf/')).resolves.toBeUndefined()
  })

  it('retries a route loader after a rejected preload', async () => {
    const transientError = new Error('temporary chunk failure')
    const module = { default: () => null }
    const importRoute = vi.fn()
      .mockRejectedValueOnce(transientError)
      .mockResolvedValueOnce(module)
    const loader = createRetryableRouteLoader(importRoute)

    await expect(loader()).rejects.toBe(transientError)
    await expect(loader()).resolves.toBe(module)
    expect(importRoute).toHaveBeenCalledTimes(2)
  })
})

describe('isStaleChunkError', () => {
  it.each([
    'Failed to fetch dynamically imported module: https://models.wtf/assets/Learn-DSb1iNhf.js',
    'Importing a module script failed.',
    'error loading dynamically imported module',
    "Expected a JavaScript module script but 'text/html' is not a valid JavaScript MIME type.",
  ])('recognizes the stale-chunk signature %#', (message) => {
    expect(isStaleChunkError(new Error(message))).toBe(true)
  })

  it.each([
    new Error('Cannot read properties of undefined'),
    new TypeError('x is not a function'),
    'a plain string that is not a chunk error',
    undefined,
  ])('leaves an unrelated error to the boundary: %s', (error) => {
    expect(isStaleChunkError(error)).toBe(false)
  })
})

describe('stale-chunk reload recovery', () => {
  const reload = vi.fn()
  const originalLocation = window.location

  beforeEach(() => {
    reload.mockClear()
    window.sessionStorage.clear()
    // jsdom's location.reload is non-configurable; swap the whole object.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
    vi.restoreAllMocks()
    window.sessionStorage.clear()
  })

  it('reloads once on a stale-chunk failure and keeps the promise pending', async () => {
    const staleError = new Error('Failed to fetch dynamically imported module: /assets/Learn.js')
    const importRoute = vi.fn().mockRejectedValue(staleError)
    const loader = createRetryableRouteLoader(importRoute)

    const settled = vi.fn()
    void loader().then(settled, settled)
    // Give the rejected import microtask a chance to run its catch handler.
    await Promise.resolve()
    await Promise.resolve()

    expect(reload).toHaveBeenCalledTimes(1)
    // The promise stays pending so the error boundary never renders mid-reload.
    expect(settled).not.toHaveBeenCalled()
  })

  it('does not reload twice within one session', async () => {
    window.sessionStorage.setItem('models-wtf:chunk-reload', '1')
    const staleError = new Error('Importing a module script failed.')
    const loader = createRetryableRouteLoader(vi.fn().mockRejectedValue(staleError))

    await expect(loader()).rejects.toBe(staleError)
    expect(reload).not.toHaveBeenCalled()
  })

  it('clears the reload guard after a successful load', async () => {
    window.sessionStorage.setItem('models-wtf:chunk-reload', '1')
    const module = { default: () => null }
    const loader = createRetryableRouteLoader(vi.fn().mockResolvedValue(module))

    await expect(loader()).resolves.toBe(module)
    expect(window.sessionStorage.getItem('models-wtf:chunk-reload')).toBeNull()
  })
})
