import { describe, it, expect } from 'vitest'
import { hasCapability, filterByCapabilities, capabilityOptions } from './capabilityFilters'
import type { Model } from '../data/types.ts'

const mockModel = (overrides?: Partial<Model>): Model => ({
  id: 'test-model',
  name: 'Test Model',
  providerId: 'anthropic',
  tier: 'flagship',
  openSource: false,
  inputPricePerMTok: 5,
  outputPricePerMTok: 15,
  contextWindowTokens: 1_000_000,
  reasoning: true,
  internetAccess: true,
  scores: {},
  blurb: 'A test model',
  ...overrides,
})

describe('capabilityFilters', () => {
  it('exports capability options', () => {
    expect(capabilityOptions.length).toBe(4)
    expect(capabilityOptions[0].id).toBe('reasoning')
  })

  describe('hasCapability', () => {
    it('detects reasoning capability', () => {
      const model = mockModel({ reasoning: true })
      expect(hasCapability(model, 'reasoning')).toBe(true)

      const noReasoning = mockModel({ reasoning: false })
      expect(hasCapability(noReasoning, 'reasoning')).toBe(false)
    })

    it('detects vision capability', () => {
      const model = mockModel({ vision: true })
      expect(hasCapability(model, 'vision')).toBe(true)

      const noVision = mockModel({ vision: false })
      expect(hasCapability(noVision, 'vision')).toBe(false)

      const undefinedVision = mockModel({ vision: undefined })
      expect(hasCapability(undefinedVision, 'vision')).toBe(false)
    })

    it('detects web-search capability from internetAccess', () => {
      const model = mockModel({ internetAccess: true })
      expect(hasCapability(model, 'web-search')).toBe(true)

      const noInternet = mockModel({ internetAccess: false })
      expect(hasCapability(noInternet, 'web-search')).toBe(false)
    })

    it('detects image-generation capability', () => {
      const model = mockModel({ imageGeneration: true })
      expect(hasCapability(model, 'image-generation')).toBe(true)

      const noImageGen = mockModel({ imageGeneration: false })
      expect(hasCapability(noImageGen, 'image-generation')).toBe(false)
    })
  })

  describe('filterByCapabilities', () => {
    const models = [
      mockModel({
        id: 'reasoning-only',
        reasoning: true,
        internetAccess: false,
        vision: false,
      }),
      mockModel({
        id: 'web-search-only',
        reasoning: false,
        internetAccess: true,
        vision: false,
      }),
      mockModel({
        id: 'all-capabilities',
        reasoning: true,
        internetAccess: true,
        vision: true,
        imageGeneration: true,
      }),
      mockModel({
        id: 'basic-model',
        reasoning: false,
        internetAccess: false,
        vision: false,
      }),
    ]

    it('returns all models when no filters applied', () => {
      const filtered = filterByCapabilities(models, new Set())
      expect(filtered).toHaveLength(4)
    })

    it('filters by single capability', () => {
      const filtered = filterByCapabilities(models, new Set(['reasoning']))
      expect(filtered).toHaveLength(2) // reasoning-only and all-capabilities
      expect(filtered.map((m) => m.id)).toContain('reasoning-only')
      expect(filtered.map((m) => m.id)).toContain('all-capabilities')
    })

    it('filters by web-search capability', () => {
      const filtered = filterByCapabilities(models, new Set(['web-search']))
      expect(filtered).toHaveLength(2) // web-search-only and all-capabilities
    })

    it('filters by multiple capabilities (AND logic)', () => {
      const filtered = filterByCapabilities(models, new Set(['reasoning', 'vision']))
      expect(filtered).toHaveLength(1) // only all-capabilities has both
      expect(filtered[0].id).toBe('all-capabilities')
    })

    it('returns empty array when no models match', () => {
      const filtered = filterByCapabilities(models, new Set(['image-generation']))
      expect(filtered).toHaveLength(1) // only all-capabilities
    })
  })
})
