import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { NodePatternCard, HoverableNode } from './NodePatternTooltip'
import { DigitNetworkDiagram } from './DigitNetworkDiagram'
import { DeepDigitNetworkDiagram } from './DeepDigitNetworkDiagram'
import { SEGMENTS, PIXEL_COUNT } from './digitClassifierModel'
import { SHAPES, PRIMITIVES } from './deepDigitModel'

afterEach(cleanup)

const blank = Array<boolean>(PIXEL_COUNT).fill(false)

describe('NodePatternCard', () => {
  it('names the neuron and draws the pattern it watches', () => {
    const pixels = Array<boolean>(64).fill(false)
    pixels[0] = true
    render(
      <NodePatternCard
        pattern={{ name: 'Top bar', color: '#123456', pixels, blurb: 'Used by 0, 2, 3.' }}
      />
    )
    expect(screen.getByText('Top bar')).toBeInTheDocument()
    expect(screen.getByText('Used by 0, 2, 3.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /pixels this neuron watches/i })).toBeInTheDocument()
  })

  it('lists the inputs a shape needs and the ones that veto it', () => {
    render(
      <NodePatternCard
        pattern={{
          name: 'Open curve, left gap',
          color: '#123456',
          needs: ['Top bar, left half', 'Upper-right line'],
          forbids: ['Upper-left line'],
        }}
      />
    )
    expect(screen.getByText(/Top bar, left half, Upper-right line/)).toBeInTheDocument()
    expect(screen.getByText(/Upper-left line/)).toBeInTheDocument()
  })

  it('reports the activation only once the network has run', () => {
    const { rerender } = render(
      <NodePatternCard pattern={{ name: 'Waist', color: '#123456' }} />
    )
    expect(screen.queryByText(/Firing at/)).not.toBeInTheDocument()

    rerender(<NodePatternCard pattern={{ name: 'Waist', color: '#123456', activation: 0.75 }} />)
    expect(screen.getByText('Firing at 75%')).toBeInTheDocument()
  })
})

describe('HoverableNode', () => {
  function renderNode(cx = 100) {
    return render(
      <svg viewBox="0 0 400 200">
        <HoverableNode
          cx={cx}
          cy={100}
          hitRadius={14}
          svgWidth={400}
          pattern={{ name: 'Top bar', color: '#123456', blurb: 'A bar across the top.' }}
        >
          <circle cx={cx} cy={100} r={10} />
        </HoverableNode>
      </svg>
    )
  }

  it('hides the tooltip until the pointer arrives', () => {
    renderNode()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    fireEvent.mouseEnter(screen.getByRole('button', { name: /Top bar detector/i }))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('A bar across the top.')).toBeInTheDocument()
  })

  it('hides it again when the pointer leaves', () => {
    renderNode()
    const target = screen.getByRole('button', { name: /Top bar detector/i })
    fireEvent.mouseEnter(target)
    fireEvent.mouseLeave(target)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('opens on keyboard focus, so the pattern is reachable without a mouse', () => {
    renderNode()
    const target = screen.getByRole('button', { name: /Top bar detector/i })
    expect(target).toHaveAttribute('tabindex', '0')

    fireEvent.focus(target)
    const tooltip = screen.getByRole('tooltip')
    expect(target).toHaveAttribute('aria-describedby', tooltip.getAttribute('id'))

    fireEvent.blur(target)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('flips the card to the left of a node near the right edge', () => {
    // 224px card + hit radius + gap does not fit to the right of x=380 in a 400-wide view.
    const { container } = renderNode(380)
    fireEvent.mouseEnter(screen.getByRole('button', { name: /Top bar detector/i }))
    const box = container.querySelector('foreignObject')!
    expect(Number(box.getAttribute('x'))).toBeLessThan(380)
  })
})

describe('network diagram hidden layers', () => {
  it('gives every stroke detector in the two-layer diagram a hover target', () => {
    render(<DigitNetworkDiagram pixels={blank} />)
    for (const seg of SEGMENTS) {
      expect(screen.getByRole('button', { name: `${seg.name} detector` })).toBeInTheDocument()
    }
  })

  it('reveals the pattern a stroke detector is looking for', () => {
    render(<DigitNetworkDiagram pixels={blank} />)
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Middle bar detector' }))
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Middle bar')
    // The middle bar is in 2, 3, 4, 5, 6, 8 and 9 but not 0, 1 or 7.
    expect(tooltip).toHaveTextContent('Used by 2, 3, 4, 5, 6, 8, 9')
  })

  it('gives both hidden layers of the three-layer diagram hover targets', () => {
    render(<DeepDigitNetworkDiagram pixels={blank} />)
    for (const prim of PRIMITIVES) {
      expect(screen.getByRole('button', { name: `${prim.name} detector` })).toBeInTheDocument()
    }
    for (const shape of SHAPES) {
      expect(screen.getByRole('button', { name: `${shape.name} detector` })).toBeInTheDocument()
    }
  })

  it('explains a shape detector as the primitives it needs and vetoes', () => {
    render(<DeepDigitNetworkDiagram pixels={blank} />)
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Straight right spine detector' }))
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('Upper-right line')
    expect(tooltip).toHaveTextContent('Vetoed by:')
    expect(tooltip).toHaveTextContent('Upper-left line')
  })
})
