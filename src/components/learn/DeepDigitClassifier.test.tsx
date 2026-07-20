import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeepDigitClassifier } from './DeepDigitClassifier'
import { PIXEL_COUNT, PRIMITIVES, SHAPES } from './deepDigitModel'

describe('DeepDigitClassifier', () => {
  it('renders the drawing grid with 64 pixels', () => {
    render(<DeepDigitClassifier />)
    expect(screen.getByLabelText('Pixel 0')).toBeInTheDocument()
    expect(screen.getByLabelText(`Pixel ${PIXEL_COUNT - 1}`)).toBeInTheDocument()
  })

  it('shows every stroke primitive with its name', () => {
    render(<DeepDigitClassifier />)
    for (const prim of PRIMITIVES) {
      expect(
        screen.getByRole('img', { name: `${prim.name} primitive weights` })
      ).toBeInTheDocument()
    }
  })

  it('shows every shape detector with its name', () => {
    render(<DeepDigitClassifier />)
    for (const shape of SHAPES) {
      expect(screen.getAllByText(shape.name).length).toBeGreaterThan(0)
    }
  })

  it('shows the four-column network diagram', () => {
    render(<DeepDigitClassifier />)
    expect(
      screen.getByRole('img', {
        name: 'Three-layer neural network with 64 pixel inputs, 10 stroke primitives, 8 shape detectors, and 10 digit outputs',
      })
    ).toBeInTheDocument()
  })

  it('disables the run button until something is drawn', () => {
    render(<DeepDigitClassifier />)
    const runButton = screen.getByRole('button', { name: /Run all three layers/ })
    expect(runButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Example: 3' }))
    expect(runButton).toBeEnabled()
  })

  it('predicts 6 from the example 6 drawing', () => {
    render(<DeepDigitClassifier />)
    fireEvent.click(screen.getByRole('button', { name: 'Example: 6' }))
    expect(screen.getByText('6', { selector: '.text-2xl' })).toBeInTheDocument()
  })

  it('reports the shapes that fire for an 8 and drops one for a 9', () => {
    render(<DeepDigitClassifier />)

    fireEvent.click(screen.getByRole('button', { name: 'Example: 8' }))
    const eightShapes = screen.getByText('Shapes firing:').nextElementSibling?.textContent

    fireEvent.click(screen.getByRole('button', { name: 'Example: 9' }))
    const nineShapes = screen.getByText('Shapes firing:').nextElementSibling?.textContent

    // A 9 is an 8 with the bottom loop opened up, so it lights one shape less.
    expect(eightShapes).toBe(`5 / ${SHAPES.length}`)
    expect(nineShapes).toBe(`4 / ${SHAPES.length}`)
  })

  it('clears back to an empty grid with no prediction', () => {
    render(<DeepDigitClassifier />)
    fireEvent.click(screen.getByRole('button', { name: 'Example: 4' }))
    expect(screen.getByText('4', { selector: '.text-2xl' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.getAllByText('—', { selector: '.text-2xl' })).toHaveLength(2)
  })
})
