import { describe, expect, it } from 'vitest'
import {
  createRetryableRouteLoader,
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
