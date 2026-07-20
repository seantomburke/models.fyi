import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { TokenVisualization } from './TokenVisualization'

// jsdom does not implement IntersectionObserver, so the component's
// no-observer fallback is what keeps the two tests below green.
test('jsdom has no IntersectionObserver, so the immediate-load fallback applies', () => {
  expect(typeof IntersectionObserver).toBe('undefined')
})

test('highlights each real BPE token piece once the tokenizer loads', async () => {
  render(<TokenVisualization />)

  // SSR-safe fallback: the sentence renders as plain text immediately.
  expect(screen.getByText('Understanding tokenization')).toBeInTheDocument()

  // After the tokenizer chunk loads, the word splits into highlighted pieces.
  await waitFor(
    () => expect(screen.getByTitle('Token 3: "ization"')).toBeInTheDocument(),
    { timeout: 10000 },
  )
  expect(screen.getByTitle('Token 2: " token"')).toHaveTextContent('token')
  expect(screen.getAllByText(/^\d+ tokens$/).length).toBeGreaterThan(0)
})

test('tokenizes custom text typed into the try-it input', async () => {
  render(<TokenVisualization />)
  const input = screen.getByLabelText('Try your own text')

  fireEvent.change(input, { target: { value: 'unbelievably' } })

  await waitFor(
    () => expect(screen.getByTitle('Token 1: "un"')).toBeInTheDocument(),
    { timeout: 10000 },
  )
  // Both the "Understanding tokenization" example and the custom text are 3 tokens.
  expect(screen.getAllByText('3 tokens')).toHaveLength(2)

  // Clearing the input hides the highlight panel instead of showing 0 tokens.
  fireEvent.change(input, { target: { value: '' } })
  expect(screen.queryByTitle('Token 1: "un"')).not.toBeInTheDocument()
})

test('defers the tokenizer chunk until the widget scrolls into view', async () => {
  const tokenize = await import('../../lib/tokenize')
  const loadSpy = vi.spyOn(tokenize, 'loadTokenSplitter')

  let fire: ((entries: { isIntersecting: boolean }[]) => void) | undefined
  const disconnect = vi.fn()
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        fire = cb
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = disconnect
      takeRecords = () => []
    },
  )

  try {
    render(<TokenVisualization />)

    // Mounted but off-screen: the megabyte chunk must not be requested.
    expect(loadSpy).not.toHaveBeenCalled()
    expect(screen.getAllByText('loading tokenizer…').length).toBeGreaterThan(0)

    act(() => fire!([{ isIntersecting: true }]))
    expect(loadSpy).toHaveBeenCalledTimes(1)

    await waitFor(
      () => expect(screen.getByTitle('Token 3: "ization"')).toBeInTheDocument(),
      { timeout: 10000 },
    )
  } finally {
    vi.unstubAllGlobals()
    loadSpy.mockRestore()
  }
})
