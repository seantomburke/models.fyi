import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { TopicCardAnimation } from './TopicCardAnimation'
import { MOTIF_LABELS, TOPIC_MOTIFS, motifFor } from './topicMotifs'
import { topics } from '../../pages/learn/topics'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

/**
 * Captures the IntersectionObserver a component creates so a test can decide
 * whether the element is on screen. jsdom ships no implementation at all.
 */
function installObserver() {
  const instances: Array<{
    callback: IntersectionObserverCallback
    observed: Element[]
    disconnected: boolean
  }> = []

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observed: Element[] = []
      disconnected = false
      callback: IntersectionObserverCallback
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
        instances.push(this)
      }
      observe(element: Element) {
        this.observed.push(element)
      }
      unobserve() {}
      disconnect() {
        this.disconnected = true
      }
      takeRecords() {
        return []
      }
    }
  )

  return {
    instances,
    enter(index = 0) {
      const instance = instances[index]
      instance.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    },
    leave(index = 0) {
      const instance = instances[index]
      instance.callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    },
  }
}

describe('topic motif mapping', () => {
  it('gives every learn topic its own motif entry', () => {
    for (const topic of topics) {
      expect(TOPIC_MOTIFS[topic.slug], `no motif for ${topic.slug}`).toBeDefined()
    }
  })

  it('labels every motif it can assign', () => {
    for (const slug of Object.keys(TOPIC_MOTIFS)) {
      expect(MOTIF_LABELS[TOPIC_MOTIFS[slug]]).toBeTruthy()
    }
  })

  it('falls back to a real motif for an unknown slug', () => {
    expect(MOTIF_LABELS[motifFor('not-a-topic')]).toBeTruthy()
  })

  it('points each lab topic at the visual from its own learning pane', () => {
    expect(TOPIC_MOTIFS['understand-image-classification']).toBe('pixels')
    expect(TOPIC_MOTIFS['how-neural-networks-recognize-digits']).toBe('digits')
    expect(TOPIC_MOTIFS['what-is-gradient-descent']).toBe('descent')
    expect(TOPIC_MOTIFS['why-neural-networks-need-more-layers']).toBe('layers')
    expect(TOPIC_MOTIFS['how-llms-predict-the-next-word']).toBe('nextWord')
  })
})

describe('TopicCardAnimation', () => {
  it('renders an accessible image for its motif', () => {
    installObserver()
    render(<TopicCardAnimation motif="tokens" label={MOTIF_LABELS.tokens} />)
    expect(screen.getByRole('img', { name: MOTIF_LABELS.tokens })).toBeInTheDocument()
  })

  it('renders every motif without throwing', () => {
    installObserver()
    for (const motif of Object.keys(MOTIF_LABELS) as Array<keyof typeof MOTIF_LABELS>) {
      const { unmount } = render(<TopicCardAnimation motif={motif} label={MOTIF_LABELS[motif]} />)
      expect(screen.getByRole('img', { name: MOTIF_LABELS[motif] })).toBeInTheDocument()
      unmount()
    }
  })

  it('only starts animating once the card scrolls into view', () => {
    const observer = installObserver()
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)

    render(<TopicCardAnimation motif="weights" label={MOTIF_LABELS.weights} />)
    // Mounted but off screen: no frame loop at all.
    expect(raf).not.toHaveBeenCalled()

    observer.enter()
    expect(raf).toHaveBeenCalled()
  })

  it('stops animating when the card scrolls back out of view', () => {
    const observer = installObserver()
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    const cancel = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    render(<TopicCardAnimation motif="weights" label={MOTIF_LABELS.weights} />)
    observer.enter()
    observer.leave()

    expect(cancel).toHaveBeenCalled()
  })

  it('tears the frame loop down on unmount', () => {
    const observer = installObserver()
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    const cancel = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    const { unmount } = render(<TopicCardAnimation motif="pixels" label={MOTIF_LABELS.pixels} />)
    observer.enter()
    unmount()

    expect(cancel).toHaveBeenCalled()
    expect(observer.instances[0].disconnected).toBe(true)
  })

  it('never schedules a frame when the visitor asks for reduced motion', () => {
    const observer = installObserver()
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true,
        }) as unknown as MediaQueryList
    )
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)

    render(<TopicCardAnimation motif="descent" label={MOTIF_LABELS.descent} />)

    // The card still paints a still frame, but it is never observed or driven.
    expect(screen.getByRole('img', { name: MOTIF_LABELS.descent })).toBeInTheDocument()
    expect(observer.instances).toHaveLength(0)
    expect(raf).not.toHaveBeenCalled()
  })
})
