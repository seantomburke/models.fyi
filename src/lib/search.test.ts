import { describe, it, expect } from 'vitest'
import { searchModels, groupSearchResults } from './search'
import { models } from '../data/index'

describe('searchModels', () => {
  it('returns all models when query is empty', () => {
    const result = searchModels('', models)
    expect(result.length).toBe(models.length)
  })

  it('filters models by name', () => {
    const result = searchModels('claude', models)
    expect(result.every((r) => r.model.name.toLowerCase().includes('claude'))).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('filters models by name case-insensitive', () => {
    const result1 = searchModels('CLAUDE', models)
    const result2 = searchModels('claude', models)
    expect(result1.map((r) => r.model.id)).toEqual(result2.map((r) => r.model.id))
  })

  it('filters by API ID', () => {
    const result = searchModels('gpt', models)
    expect(result.length).toBeGreaterThan(0)
  })

  it('filters by reasoning capability', () => {
    const result = searchModels('reasoning', models)
    expect(result.every((r) => r.model.reasoning)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('filters by internet access capability', () => {
    const result = searchModels('web', models)
    expect(result.every((r) => r.model.internetAccess)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('trims whitespace from query', () => {
    const result1 = searchModels('  claude  ', models)
    const result2 = searchModels('claude', models)
    expect(result1.map((r) => r.model.id)).toEqual(result2.map((r) => r.model.id))
  })

  it('returns empty array for non-matching query', () => {
    const result = searchModels('nonexistentmodel123', models)
    expect(result).toEqual([])
  })

  it('returns models with relevance scores', () => {
    const result = searchModels('claude', models)
    expect(result.every((r) => r.relevance > 0)).toBe(true)
  })

  it('sorts by relevance descending', () => {
    const result = searchModels('opus', models)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].relevance).toBeGreaterThanOrEqual(result[i + 1].relevance)
    }
  })

  it('supports both argument orders', () => {
    const result1 = searchModels('claude', models)
    const result2 = searchModels(models, 'claude')
    expect(result1.map((r) => r.model.id)).toEqual(result2.map((r) => r.model.id))
  })
})

describe('groupSearchResults', () => {
  it('groups results by match type', () => {
    const results = searchModels('claude', models)
    const grouped = groupSearchResults(results)

    expect(grouped.name).toBeDefined()
    expect(grouped.capability).toBeDefined()
    expect(grouped.all).toBeDefined()
  })

  it('includes all original results in groups', () => {
    const results = searchModels('claude', models)
    const grouped = groupSearchResults(results)
    const total = grouped.name.length + grouped.capability.length + grouped.all.length
    expect(total).toBe(results.length)
  })
})
