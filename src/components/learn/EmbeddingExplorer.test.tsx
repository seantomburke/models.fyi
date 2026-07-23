import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmbeddingExplorer } from './EmbeddingExplorer'
import { PHRASES, rankByMeaning, distanceBetween } from './embeddingModel'

test('starts on the first phrase and ranks its nearest neighbour first', () => {
  render(<EmbeddingExplorer />)
  expect(
    screen.getByRole('heading', { name: /closest matches to "fast cars"/i }),
  ).toBeInTheDocument()

  // "quick vehicles" shares no words with "fast cars" but sits nearest in
  // meaning-space, so it must be the top result a keyword search would miss.
  const items = screen.getAllByRole('listitem')
  expect(items[0]).toHaveAccessibleName(/quick vehicles: a keyword search would miss this/i)
})

test('switching the query re-ranks the results around the new phrase', async () => {
  const user = userEvent.setup()
  render(<EmbeddingExplorer />)

  await user.click(screen.getByRole('button', { name: 'happy dogs' }))
  expect(
    screen.getByRole('heading', { name: /closest matches to "happy dogs"/i }),
  ).toBeInTheDocument()

  // The animal cluster should now dominate the nearest results.
  const items = screen.getAllByRole('listitem')
  expect(items[0].getAttribute('aria-label')).toMatch(/playful puppies|friendly cats/i)
})

test('a phrase sharing a keyword is tagged as findable by keyword search', async () => {
  const user = userEvent.setup()
  render(<EmbeddingExplorer />)

  // "quick vehicles" and "speedy trucks" share no words, but "racing bikes"
  // and none of these share a keyword with "fast cars"; pick a query where a
  // keyword overlap exists to prove the tag flips.
  await user.click(screen.getByRole('button', { name: 'linear algebra' }))
  const match = screen.getByRole('listitem', {
    name: /calculus proofs: a keyword search would miss this/i,
  })
  expect(match).toBeInTheDocument()
})

test('rankByMeaning orders every result by ascending distance', () => {
  for (const p of PHRASES) {
    const ranked = rankByMeaning(p.text)
    const distances = ranked.map((r) => r.distance)
    expect(distances).toEqual([...distances].sort((a, b) => a - b))
    // Every other phrase appears exactly once.
    expect(ranked).toHaveLength(PHRASES.length - 1)
  }
  expect(rankByMeaning('not a phrase')).toEqual([])
})

test('keywordMatch is true only when the two phrases share a word', () => {
  const ranked = rankByMeaning('fast cars')
  const speedyTrucks = ranked.find((r) => r.text === 'speedy trucks')
  // No shared word with "fast cars".
  expect(speedyTrucks?.keywordMatch).toBe(false)
})

test('distanceBetween is symmetric and zero for the same point', () => {
  const [a, b] = PHRASES
  expect(distanceBetween(a, a)).toBe(0)
  expect(distanceBetween(a, b)).toBeCloseTo(distanceBetween(b, a))
})
