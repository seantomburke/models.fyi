import { render, screen, waitFor, act } from '@testing-library/react'
import { MathBlock } from './MathBlock'

// jsdom does not implement IntersectionObserver, so the component's
// no-observer fallback loads KaTeX immediately in these tests.

test('renders the plain-text fallback synchronously, then upgrades to KaTeX', async () => {
  const { container } = render(
    <MathBlock tex={String.raw`a \times b`} fallback="a × b" />,
  )

  // The fallback is what prerendered HTML ships.
  expect(screen.getByText('a × b')).toBeInTheDocument()

  await waitFor(
    () => expect(container.querySelector('.katex')).toBeInTheDocument(),
    { timeout: 10000 },
  )
  // The equation stays readable to assistive tech through the label.
  // (aria-label is asserted directly; jsdom cannot getComputedStyle the
  // KaTeX stylesheet, which breaks role queries after the CSS loads.)
  expect(container.querySelector('[role="math"]')).toHaveAttribute('aria-label', 'a × b')
})

test('bad LaTeX renders as a visible error instead of throwing (throwOnError: false)', async () => {
  const { container } = render(
    <MathBlock tex={String.raw`\notacommand{`} fallback="broken" />,
  )
  await waitFor(
    () => expect(container.querySelector('.katex-error')).toBeInTheDocument(),
    { timeout: 10000 },
  )
})

test('defers the KaTeX chunk until the equation scrolls into view', async () => {
  let fire: ((entries: { isIntersecting: boolean }[]) => void) | undefined
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        fire = cb
      }
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      takeRecords = () => []
    },
  )

  try {
    const { container } = render(
      <MathBlock tex={String.raw`x + y`} fallback="x + y" />,
    )

    // Mounted but off-screen: only the fallback exists.
    expect(container.querySelector('.katex')).not.toBeInTheDocument()
    expect(screen.getByText('x + y')).toBeInTheDocument()

    act(() => fire!([{ isIntersecting: true }]))

    await waitFor(
      () => expect(container.querySelector('.katex')).toBeInTheDocument(),
      { timeout: 10000 },
    )
  } finally {
    vi.unstubAllGlobals()
  }
})
