import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { models } from '../../data/models'
import { providers } from '../../data'
import { ModelsIndex } from './ModelsIndex'

function renderIndex() {
  render(
    <MemoryRouter initialEntries={['/models']}>
      <ModelsIndex />
    </MemoryRouter>,
  )
}

describe('ModelsIndex page', () => {
  test('links to every model detail page', () => {
    renderIndex()

    // The whole point of this page: no model page is left orphaned.
    for (const model of models) {
      expect(screen.getByRole('link', { name: new RegExp(model.name, 'i') })).toHaveAttribute(
        'href',
        `/models/${model.id}`,
      )
    }
  })

  test('groups models under a heading for each provider that has one', () => {
    renderIndex()

    for (const provider of providers) {
      const hasModels = models.some((m) => m.providerId === provider.id)
      const heading = screen.queryByRole('heading', { name: provider.name, level: 2 })
      // Providers with no models must not render an empty section.
      expect(Boolean(heading)).toBe(hasModels)
    }
  })

  test('nests model headings below provider headings', () => {
    renderIndex()
    const provider = providers.find((candidate) =>
      models.some((model) => model.providerId === candidate.id),
    )!
    const model = models.find((candidate) => candidate.providerId === provider.id)!

    expect(screen.getByRole('heading', { level: 2, name: provider.name })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: model.name })).toBeInTheDocument()
  })

  test('names self-hosted pricing instead of a footnote-less "Free*"', () => {
    renderIndex()

    const selfHosted = models.filter(
      (m) => m.inputPricePerMTok === null || m.outputPricePerMTok === null,
    )
    if (selfHosted.length > 0) {
      expect(screen.getAllByText(/self-hosted pricing/i).length).toBe(selfHosted.length)
    }
    expect(screen.queryByText(/Free\*/)).toBeNull()
  })
})
