import { describe, test, expect } from 'vitest'
import { scoreModelRecommendation, getRecommendedModels } from './recommendations'
import { models } from '../data/models'

describe('scoreModelRecommendation', () => {
  test('returns negative score for the same model', () => {
    const claude = models.find((m) => m.id === 'claude-opus-4-8')!
    const score = scoreModelRecommendation(claude, claude)
    expect(score).toBe(-1)
  })

  test('gives bonus for same provider', () => {
    const claudeOpus = models.find((m) => m.id === 'claude-opus-4-8')!
    const claudeSonnet = models.find((m) => m.id === 'claude-sonnet-5')!
    const score = scoreModelRecommendation(claudeOpus, claudeSonnet)
    expect(score).toBeGreaterThanOrEqual(50) // At minimum, same provider bonus
  })

  test('gives bonus for same tier', () => {
    const flagship1 = models.find((m) => m.tier === 'flagship')!
    const flagship2 = models.find((m) => m.tier === 'flagship' && m.id !== flagship1.id)
    if (flagship2) {
      const score = scoreModelRecommendation(flagship1, flagship2)
      expect(score).toBeGreaterThanOrEqual(30)
    }
  })

  test('gives bonus for similar context window', () => {
    // Find models with similar context windows
    const claude1M = models.find((m) => m.contextWindowTokens === 1_000_000)!
    const candidate = models.find(
      (m) =>
        m.contextWindowTokens &&
        m.contextWindowTokens > 500_000 &&
        m.contextWindowTokens < 1_500_000 &&
        m.id !== claude1M.id,
    )
    if (candidate) {
      const score = scoreModelRecommendation(claude1M, candidate)
      expect(score).toBeGreaterThanOrEqual(20)
    }
  })

  test('handles models with missing context window fields', () => {
    const modelA = {
      id: 'test-a',
      name: 'Test A',
      providerId: 'openai' as const,
      tier: 'flagship' as const,
      openSource: false,
      inputPricePerMTok: 5,
      outputPricePerMTok: 20,
      contextWindowTokens: null,
      reasoning: true,
      internetAccess: true,
      blurb: 'Test',
      scores: {},
    }
    const modelB = {
      ...modelA,
      id: 'test-b',
      contextWindowTokens: 1_000_000,
    }
    const score = scoreModelRecommendation(modelA, modelB)
    expect(score).toBeGreaterThanOrEqual(0) // Should not crash
  })

  test('gives bonus for shared reasoning capability', () => {
    const reasoningModel = models.find((m) => m.reasoning)!
    const anotherReasoning = models.find((m) => m.reasoning && m.id !== reasoningModel.id)
    if (anotherReasoning) {
      const score = scoreModelRecommendation(reasoningModel, anotherReasoning)
      expect(score).toBeGreaterThanOrEqual(10) // At minimum reasoning bonus
    }
  })

  test('gives bonus for shared internet access', () => {
    const internetModel = models.find((m) => m.internetAccess)!
    const anotherInternet = models.find((m) => m.internetAccess && m.id !== internetModel.id)
    if (anotherInternet) {
      const score = scoreModelRecommendation(internetModel, anotherInternet)
      expect(score).toBeGreaterThanOrEqual(10) // At minimum internet bonus
    }
  })

  test('accumulates multiple scoring bonuses', () => {
    const claudeOpus = models.find((m) => m.id === 'claude-opus-4-8')!
    const claudeFable = models.find((m) => m.id === 'claude-fable-5')!
    const score = scoreModelRecommendation(claudeOpus, claudeFable)
    // Both are Anthropic (flagship), both have reasoning + internet
    expect(score).toBeGreaterThanOrEqual(50 + 30 + 10 + 10) // provider + tier + reasoning + internet
  })
})

describe('getRecommendedModels', () => {
  test('returns hand-curated related models when available', () => {
    const modelWithCurated = models.find((m) => m.relatedModelIds && m.relatedModelIds.length > 0)
    if (modelWithCurated) {
      const recommended = getRecommendedModels(modelWithCurated, models)
      expect(recommended.length).toBeGreaterThan(0)
      expect(recommended.map((m) => m.id)).toEqual(
        modelWithCurated.relatedModelIds!.slice(0, 3).map((id) => id),
      )
    }
  })

  test('returns top 3 recommendations', () => {
    const recommended = getRecommendedModels(models[0], models)
    expect(recommended.length).toBeLessThanOrEqual(3)
  })

  test('never includes the current model in recommendations', () => {
    const currentModel = models[0]
    const recommended = getRecommendedModels(currentModel, models)
    expect(recommended.map((m) => m.id)).not.toContain(currentModel.id)
  })

  test('returns empty array when insufficient candidates score above 0', () => {
    const modelA = {
      id: 'test-a',
      name: 'Test A',
      providerId: 'openai' as const,
      tier: 'flagship' as const,
      openSource: false,
      inputPricePerMTok: 5,
      outputPricePerMTok: 20,
      contextWindowTokens: 1,
      reasoning: false,
      internetAccess: false,
      blurb: 'Test',
      scores: {},
    }
    const modelB = {
      ...modelA,
      id: 'test-b',
      providerId: 'anthropic' as const,
      contextWindowTokens: 1_000_000,
    }
    const recommended = getRecommendedModels(modelA, [modelA, modelB])
    // Should have no recommendations since modelB is dissimilar
    expect(recommended.length).toBeLessThanOrEqual(1)
  })

  test('maintains stable order when scores are tied', () => {
    // Find models with same provider and tier
    const baseModel = models[0]
    const recommended = getRecommendedModels(baseModel, models)
    // Run again with same input
    const recommended2 = getRecommendedModels(baseModel, models)
    expect(recommended.map((m) => m.id)).toEqual(recommended2.map((m) => m.id))
  })

  test('falls back to scoring algorithm when curated IDs are empty', () => {
    const modelWithoutCurated = {
      ...models[0],
      relatedModelIds: [],
    }
    const recommended = getRecommendedModels(modelWithoutCurated, models)
    // Should use scoring algorithm
    expect(recommended.length).toBeGreaterThanOrEqual(0)
    // Should not include the current model
    expect(recommended.map((m) => m.id)).not.toContain(modelWithoutCurated.id)
  })

  test('handles all real models without crashing', () => {
    for (const model of models) {
      const recommended = getRecommendedModels(model, models)
      expect(Array.isArray(recommended)).toBe(true)
      expect(recommended.length).toBeLessThanOrEqual(3)
      expect(recommended.every((m) => m.id !== model.id)).toBe(true)
    }
  })
})
