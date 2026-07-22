import { glossaryTerms } from './glossary'
import { topics } from '../pages/learn/topics'

test('provides at least 50 unique, usable glossary terms', () => {
  expect(glossaryTerms.length).toBeGreaterThanOrEqual(50)

  const ids = glossaryTerms.map((term) => term.id)
  const names = glossaryTerms.map((term) => term.term.toLocaleLowerCase())
  expect(new Set(ids).size).toBe(ids.length)
  expect(new Set(names).size).toBe(names.length)

  for (const term of glossaryTerms) {
    expect(term.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    expect(term.term.trim()).not.toBe('')
    expect(term.short.trim()).not.toBe('')
    expect(term.long.trim()).not.toBe('')
  }
})

test('every internal Learn link points at a real topic', () => {
  const slugs = new Set(topics.map((t) => t.slug))
  const broken = glossaryTerms
    .filter((t) => t.relatedLearnTopic && !slugs.has(t.relatedLearnTopic))
    .map((t) => `${t.id} -> ${t.relatedLearnTopic}`)
  expect(broken).toEqual([])
})

test('includes the requested agent and protocol jargon with plain-language explanations', () => {
  const requestedTerms = [
    'ai-agent',
    'a2a',
    'lsp',
    'mcp',
    'multimodal',
    'rag',
  ]

  for (const id of requestedTerms) {
    const term = glossaryTerms.find((entry) => entry.id === id)
    expect(term).toBeDefined()
    expect(term?.short).not.toBe('')
    expect(term?.long).not.toBe('')
  }

  expect(glossaryTerms.find((entry) => entry.id === 'a2a')?.term).toContain('Agent2Agent')
  expect(glossaryTerms.find((entry) => entry.id === 'lsp')?.term).toContain('Language Server Protocol')
  expect(glossaryTerms.find((entry) => entry.id === 'mcp')?.term).toContain('Model Context Protocol')
})
