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
