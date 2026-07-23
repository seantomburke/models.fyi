import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { models } from '../../data/models'
import { benchmarks, providers, releases } from '../../data'
import { ProviderDetail, headlineBenchmark, releasesForProvider } from './ProviderDetail'

const { capture } = vi.hoisted(() => ({ capture: vi.fn() }))

vi.mock('../../lib/analytics', () => ({ capture }))

beforeEach(() => {
  capture.mockClear()
})

function renderProvider(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/providers/${id}`]}>
      <Routes>
        <Route path="/providers/:id" element={<ProviderDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProviderDetail page', () => {
  test('renders the provider header with its blurb', () => {
    const provider = providers[0]
    renderProvider(provider.id)

    expect(screen.getByRole('heading', { level: 1, name: provider.name })).toBeInTheDocument()
    expect(screen.getByText(provider.blurb)).toBeInTheDocument()
    expect(capture).toHaveBeenCalledWith('provider_detail_viewed', {
      provider_id: provider.id,
      model_count: models.filter((model) => model.providerId === provider.id).length,
      is_open_source: provider.openSource,
    })
  })

  test('shows the open-source badge only for open-source providers', () => {
    const open = providers.find((p) => p.openSource)!
    const closed = providers.find((p) => !p.openSource)!

    const { unmount } = renderProvider(open.id)
    expect(screen.getByText('Open source')).toBeInTheDocument()
    unmount()

    renderProvider(closed.id)
    expect(screen.queryByText('Open source')).not.toBeInTheDocument()
  })

  test('lists exactly the provider\'s own models, each linking to its detail page', () => {
    const provider = providers.find((p) => models.some((m) => m.providerId === p.id))!
    const providerModels = models.filter((m) => m.providerId === provider.id)
    renderProvider(provider.id)

    const table = screen.getByRole('table')
    for (const model of providerModels) {
      const link = within(table).getByRole('link', { name: model.name })
      expect(link).toHaveAttribute('href', `/models/${model.id}`)
    }
    // No other provider's model leaks into the table.
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(providerModels.length + 1) // + header row
  })

  test('shows only releases whose model belongs to the provider', () => {
    // Pick a provider that actually has release entries so the section renders.
    const provider = providers.find((p) => {
      const ids = new Set(models.filter((m) => m.providerId === p.id).map((m) => m.id))
      return releases.some((r) => r.modelId && ids.has(r.modelId))
    })!
    const providerModels = models.filter((m) => m.providerId === provider.id)
    const expected = releasesForProvider(providerModels)
    expect(expected.length).toBeGreaterThan(0)

    renderProvider(provider.id)
    const section = screen.getByRole('heading', {
      name: `Recent ${provider.name} releases`,
    }).parentElement!
    for (const release of expected) {
      expect(within(section).getByText(release.title)).toBeInTheDocument()
    }
  })

  test('releasesForProvider excludes site-wide releases and other providers\' models', () => {
    for (const provider of providers) {
      const providerModels = models.filter((m) => m.providerId === provider.id)
      const ids = new Set(providerModels.map((m) => m.id))
      const result = releasesForProvider(providerModels)
      for (const release of result) {
        expect(release.modelId).toBeDefined()
        expect(ids.has(release.modelId!)).toBe(true)
      }
      // Newest first.
      const dates = result.map((r) => r.date)
      expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
    }
  })

  test('headlineBenchmark picks the benchmark most of the lineup has scores for', () => {
    for (const provider of providers) {
      const providerModels = models.filter((m) => m.providerId === provider.id)
      const best = headlineBenchmark(providerModels)
      if (providerModels.length === 0) continue
      expect(best).toBeDefined()
      const bestCount = providerModels.filter((m) => m.scores[best!.id] !== undefined).length
      for (const benchmark of benchmarks) {
        const count = providerModels.filter((m) => m.scores[benchmark.id] !== undefined).length
        expect(bestCount).toBeGreaterThanOrEqual(count)
      }
    }
  })

  test('links to the pre-filtered provider comparison and the models index', () => {
    const provider = providers.find((p) => models.some((m) => m.providerId === p.id))!
    renderProvider(provider.id)

    expect(screen.getByRole('link', { name: /compare these models/i })).toHaveAttribute(
      'href',
      `/compare?filter=${provider.id}`,
    )
    expect(screen.getByRole('link', { name: /browse every model/i })).toHaveAttribute(
      'href',
      '/models',
    )
  })

  test('records a provider model choice with stable autocapture selectors', async () => {
    const user = userEvent.setup()
    const provider = providers.find((p) => models.some((m) => m.providerId === p.id))!
    const model = models.find((item) => item.providerId === provider.id)!
    renderProvider(provider.id)

    const link = screen.getByRole('link', { name: model.name })
    expect(link).toHaveAttribute('data-attr', 'provider-model-link')
    await user.click(link)

    expect(capture).toHaveBeenCalledWith('provider_model_clicked', {
      provider_id: provider.id,
      model_id: model.id,
    })
  })

  test('renders NotFound for an unknown provider id', () => {
    renderProvider('not-a-provider')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: /anthropic/i })).not.toBeInTheDocument()
  })

  test('every provider has a blurb long enough to serve as a meta description', () => {
    for (const provider of providers) {
      expect(provider.blurb.length).toBeGreaterThan(50)
    }
  })
})
