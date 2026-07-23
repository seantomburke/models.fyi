import { describe, it, expect } from 'vitest'
import { searchContent } from './contentSearch'

describe('searchContent', () => {
  it('returns empty array for an empty query', () => {
    expect(searchContent('')).toEqual([])
    expect(searchContent('   ')).toEqual([])
  })

  it('returns empty array when nothing matches', () => {
    expect(searchContent('zzzznonexistentquery123')).toEqual([])
  })

  it('ranks a provider name match at 100 and links to the provider page', () => {
    const results = searchContent('anthropic')
    const provider = results.filter((r) => r.kind === 'provider')
    expect(provider.length).toBe(1)
    expect(provider[0].title).toBe('Anthropic')
    expect(provider[0].relevance).toBe(100)
    expect(provider[0].to).toBe('/providers/anthropic')
  })

  it('finds providers by blurb text at lower relevance', () => {
    const results = searchContent('shocked the field')
    const provider = results.filter((r) => r.kind === 'provider')
    expect(provider.length).toBe(1)
    expect(provider[0].title).toBe('DeepSeek')
    expect(provider[0].relevance).toBe(50)
  })

  it('returns no provider results when nothing in providers matches', () => {
    const results = searchContent('hallucination')
    expect(results.filter((r) => r.kind === 'provider')).toEqual([])
  })

  it('ranks an exact glossary term match first', () => {
    const results = searchContent('hallucination')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].kind).toBe('glossary')
    expect(results[0].title.toLowerCase()).toContain('hallucination')
    expect(results[0].to).toMatch(/^\/glossary\?q=/)
  })

  it('finds Learn topics by title', () => {
    const results = searchContent('context window')
    const learn = results.filter((r) => r.kind === 'learn')
    expect(learn.length).toBeGreaterThan(0)
    expect(learn[0].to).toMatch(/^\/learn\//)
  })

  it('finds FAQs by question text', () => {
    const results = searchContent('open-source models')
    const faq = results.filter((r) => r.kind === 'faq')
    expect(faq.length).toBeGreaterThan(0)
    expect(faq[0].title.toLowerCase()).toContain('open-source')
    expect(faq[0].to).toMatch(/^\/faq\?q=/)
  })

  it('caps snippets at ~140 characters', () => {
    for (const result of searchContent('model')) {
      expect(result.snippet.length).toBeLessThanOrEqual(141)
    }
  })

  it('sorts results by relevance descending', () => {
    const results = searchContent('token')
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].relevance).toBeGreaterThanOrEqual(results[i + 1].relevance)
    }
  })
})
