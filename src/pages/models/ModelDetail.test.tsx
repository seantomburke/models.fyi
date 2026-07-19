import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { models } from '../../data/models'
import { providers } from '../../data'
import { ModelDetail } from './ModelDetail'

describe('ModelDetail page', () => {
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
