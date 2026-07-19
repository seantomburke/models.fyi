import { glossaryTerms } from './glossary'
import { topics } from '../pages/learn/topics'

test('every relatedLearnTopic points at a real Learn topic', () => {
  const slugs = new Set(topics.map((t) => t.slug))
  const broken = glossaryTerms
    .filter((t) => t.relatedLearnTopic && !slugs.has(t.relatedLearnTopic))
    .map((t) => `${t.id} -> ${t.relatedLearnTopic}`)
  expect(broken).toEqual([])
})

test('glossary term ids are unique', () => {
  const ids = glossaryTerms.map((t) => t.id)
  expect(new Set(ids).size).toBe(ids.length)
})
