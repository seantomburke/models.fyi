import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Learn } from './Learn'
import { LearnTopic } from './LearnTopic'
import { topics, levels } from './topics'
import { topicProse } from './topicProse'

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:slug" element={<LearnTopic />} />
      </Routes>
    </MemoryRouter>,
  )
}

test('index links every topic', () => {
  renderAt('/learn')
  for (const t of topics) {
    // Each topic appears twice: once as a card, once in the sidebar index.
    const links = screen.getAllByRole('link', { name: new RegExp(t.question, 'i') })
    expect(links.length).toBeGreaterThanOrEqual(2)
    for (const link of links) {
      expect(link).toHaveAttribute('href', `/learn/${t.slug}`)
    }
  }
})

test('the sidebar index lists every lesson under its level header', () => {
  renderAt('/learn')
  const toc = screen.getByRole('navigation', { name: 'All lessons' })
  const { getByRole, getByText } = within(toc)
  for (const level of levels) {
    expect(getByText(level.title)).toBeInTheDocument()
  }
  for (const t of topics) {
    expect(getByRole('link', { name: t.question })).toHaveAttribute('href', `/learn/${t.slug}`)
  }
})

test('every topic page renders with unique SEO meta and cross-links', () => {
  const seenTitles = new Set<string>()
  for (const t of topics) {
    renderAt(`/learn/${t.slug}`)
    expect(screen.getByRole('heading', { level: 1, name: t.question })).toBeInTheDocument()
    expect(document.title).toBe(t.metaTitle)
    expect(seenTitles.has(t.metaTitle)).toBe(false)
    seenTitles.add(t.metaTitle)
    // Cross-links to the interactive pages.
    expect(screen.getByRole('link', { name: /recommendation in 4 questions/i })).toBeInTheDocument()
    document.body.innerHTML = ''
  }
})

test('index groups topics under the four learning-path levels', () => {
  renderAt('/learn')
  for (const level of levels) {
    expect(screen.getByRole('heading', { level: 2, name: level.title })).toBeInTheDocument()
  }
  // The learning path walks levels in order: every topic's level rank is
  // greater than or equal to the one before it.
  const rank = new Map(levels.map((l, i) => [l.id, i]))
  for (let i = 1; i < topics.length; i++) {
    expect(rank.get(topics[i].level)!).toBeGreaterThanOrEqual(rank.get(topics[i - 1].level)!)
  }
})

test('keeps model-versus-model topics together after the intro and outside the learning path', () => {
  renderAt('/learn')

  const comparisons = screen.getByRole('region', { name: /model vs\. model/i })
  const comparisonSlugs = ['claude-vs-gpt', 'claude-vs-gemini', 'grok-vs-gpt']

  for (const slug of comparisonSlugs) {
    const topic = topics.find((candidate) => candidate.slug === slug)!
    const link = within(comparisons).getByRole('link', { name: new RegExp(topic.question, 'i') })
    expect(comparisons).toContainElement(link)
    expect(link).toHaveTextContent('Head-to-head comparison')
  }

  expect(comparisons).toHaveTextContent('Anthropic')
  expect(comparisons).toHaveTextContent('OpenAI')
  expect(comparisons).toHaveTextContent('Google')
  expect(comparisons).toHaveTextContent('xAI')

  for (const level of levels) {
    const pathSection = screen.getByRole('region', { name: level.title })
    for (const slug of comparisonSlugs) {
      const topic = topics.find((candidate) => candidate.slug === slug)!
      expect(pathSection).not.toHaveTextContent(topic.question)
    }
  }

  expect(
    comparisons.compareDocumentPosition(screen.getByRole('region', { name: levels[0].title })),
  ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
})

test('keeps animated previews for learning-path topics but not model comparisons', () => {
  renderAt('/learn')

  const comparisons = screen.getByRole('region', { name: /model vs\. model/i })
  const comparison = within(comparisons).getByRole('link', { name: /claude vs gpt/i })
  expect(comparison.querySelector('[data-motif]')).toBeNull()

  const standardTopic = screen
    .getAllByRole('link', { name: /what is an ai model/i })
    .find((link) => link.querySelector('[data-motif]') !== null)
  expect(standardTopic).toBeDefined()
  expect(standardTopic!.querySelector('[data-motif]')).not.toBeNull()
})

test('lab topics with a named model render its model card', () => {
  renderAt('/learn/understand-image-classification')
  expect(screen.getByText('Doodle-64')).toBeInTheDocument()
  expect(screen.getByText('Model card')).toBeInTheDocument()
  expect(screen.getByText('Parameters')).toBeInTheDocument()
  document.body.innerHTML = ''
  renderAt('/learn/how-neural-networks-recognize-digits')
  expect(screen.getByText('Doodle-525')).toBeInTheDocument()
})

test('the Parrot-2D and Finch-4 labs link to each other', () => {
  renderAt('/learn/how-word-embeddings-predict-the-next-word')
  expect(screen.getByRole('link', { name: /Finch-4's position and attention lab/i })).toHaveAttribute(
    'href',
    '/learn/how-position-and-attention-make-language-models-grammatical',
  )
  document.body.innerHTML = ''
  renderAt('/learn/how-position-and-attention-make-language-models-grammatical')
  expect(screen.getByRole('link', { name: /the Parrot-2D embedding lab/i })).toHaveAttribute(
    'href',
    '/learn/how-word-embeddings-predict-the-next-word',
  )
})

test('unknown topic slug shows not-found with a way back', () => {
  renderAt('/learn/nope')
  expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /see all topics/i })).toBeInTheDocument()
})

test('topics use semantic heading structure', () => {
  renderAt(`/learn/${topics[0].slug}`)
  expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(1)
})

// Body copy lives in topicProse.ts keyed by `<slug>::<heading>`, so a renamed
// heading or a stale key would silently render a section with no paragraphs.
// LearnTopic falls back to [] rather than crashing, which is exactly why the
// mismatch needs a test to be visible at all.
test('every topic section resolves its body copy', () => {
  const missing: string[] = []
  for (const topic of topics) {
    for (const section of topic.sections) {
      const paragraphs = topicProse[`${topic.slug}::${section.heading}`]
      if (!paragraphs?.length) missing.push(`${topic.slug}::${section.heading}`)
    }
  }
  expect(missing).toEqual([])
})

test('no orphaned body copy is left behind by a renamed section', () => {
  const live = new Set(
    topics.flatMap((t) => t.sections.map((s) => `${t.slug}::${s.heading}`)),
  )
  expect(Object.keys(topicProse).filter((key) => !live.has(key))).toEqual([])
})
