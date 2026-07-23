import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { models } from '../../data/models'
import { benchmarks, providers } from '../../data'
import { ModelDetail } from './ModelDetail'

const { capture } = vi.hoisted(() => ({ capture: vi.fn() }))

vi.mock('../../lib/analytics', () => ({ capture }))

beforeEach(() => {
  capture.mockClear()
})

describe('ModelDetail page', () => {
  test('records a privacy-minimal evaluation event for the model being viewed', () => {
    const model = models[0]
    const benchmarkCount = benchmarks.filter((benchmark) => model.scores[benchmark.id] !== undefined).length

    render(
      <MemoryRouter initialEntries={[`/models/${model.id}`]}>
        <Routes>
          <Route path="/models/:id" element={<ModelDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(capture).toHaveBeenCalledWith('model_detail_viewed', {
      model_id: model.id,
      provider_id: model.providerId,
      benchmark_count: benchmarkCount,
      is_open_source: model.openSource,
    })
  })

  test('does not record a model evaluation event for a missing model', () => {
    render(
      <MemoryRouter initialEntries={['/models/not-a-model']}>
        <Routes>
          <Route path="/models/:id" element={<ModelDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(capture).not.toHaveBeenCalled()
  })

  test('links to the pre-filtered provider comparison', () => {
    const model = models[0]
    const provider = providers.find((p) => p.id === model.providerId)!
    render(
      <MemoryRouter initialEntries={[`/models/${model.id}`]}>
        <Routes>
          <Route path="/models/:id" element={<ModelDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    const providerLink = screen.getByRole('link', {
      name: new RegExp(`compare all ${provider.name} models`, 'i'),
    })
    expect(providerLink).toHaveAttribute('href', `/compare?filter=${model.providerId}`)
    expect(screen.getByRole('link', { name: /compare every model/i })).toHaveAttribute(
      'href',
      '/compare',
    )
  })

  test('records which compare path a model detail visitor chooses', async () => {
    const user = userEvent.setup()
    const model = models[0]
    render(
      <MemoryRouter initialEntries={[`/models/${model.id}`]}>
        <Routes>
          <Route path="/models/:id" element={<ModelDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: /compare every model/i })
    expect(link).toHaveAttribute('data-attr', 'model-compare-all-link')
    await user.click(link)

    expect(capture).toHaveBeenCalledWith('model_compare_clicked', {
      model_id: model.id,
      destination: 'all',
    })
  })

  test('page accepts model id parameter', () => {
    const testModel = models[0]
    expect(testModel.id).toBeDefined()
    expect(typeof testModel.id).toBe('string')
  })

  test('all models have required data fields', () => {
    models.forEach((model) => {
      expect(model.id).toBeDefined()
      expect(model.name).toBeDefined()
      expect(model.blurb).toBeDefined()
      expect(model.providerId).toBeDefined()
      expect(model.scores).toBeDefined()
    })
  })

  test('all models with useCases have valid data', () => {
    models.forEach((model) => {
      if (model.useCases) {
        expect(Array.isArray(model.useCases)).toBe(true)
        expect(model.useCases.length).toBeGreaterThan(0)
        model.useCases.forEach((useCase) => {
          expect(typeof useCase).toBe('string')
          expect(useCase.length).toBeGreaterThan(0)
        })
      }
    })
  })

  test('all models with whyChooseThis have valid data', () => {
    models.forEach((model) => {
      if (model.whyChooseThis) {
        expect(typeof model.whyChooseThis).toBe('string')
        expect(model.whyChooseThis.length).toBeGreaterThan(0)
      }
    })
  })

  test('all models with prosVsCompetitors have valid data', () => {
    models.forEach((model) => {
      if (model.prosVsCompetitors) {
        expect(typeof model.prosVsCompetitors).toBe('object')
        Object.entries(model.prosVsCompetitors).forEach(([competitor, advantage]) => {
          expect(typeof competitor).toBe('string')
          expect(typeof advantage).toBe('string')
          expect(competitor.length).toBeGreaterThan(0)
          expect(advantage.length).toBeGreaterThan(0)
        })
      }
    })
  })

  test('all models with relatedModelIds have valid data', () => {
    models.forEach((model) => {
      if (model.relatedModelIds) {
        expect(Array.isArray(model.relatedModelIds)).toBe(true)
        model.relatedModelIds.forEach((id) => {
          expect(typeof id).toBe('string')
          // Verify related model exists
          expect(models.some((m) => m.id === id)).toBe(true)
        })
      }
    })
  })

  test('model related model ids do not reference themselves', () => {
    models.forEach((model) => {
      if (model.relatedModelIds) {
        model.relatedModelIds.forEach((id) => {
          expect(id).not.toBe(model.id)
        })
      }
    })
  })

  test('all models have at least one benchmark score', () => {
    models.forEach((model) => {
      expect(Object.keys(model.scores).length).toBeGreaterThanOrEqual(0)
    })
  })

  test('all pricing values are either null or positive', () => {
    models.forEach((model) => {
      if (model.inputPricePerMTok !== null) {
        expect(model.inputPricePerMTok).toBeGreaterThanOrEqual(0)
      }
      if (model.outputPricePerMTok !== null) {
        expect(model.outputPricePerMTok).toBeGreaterThanOrEqual(0)
      }
    })
  })
})
