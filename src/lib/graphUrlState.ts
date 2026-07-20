import { axisOptions } from './graph.ts'
import type { GraphConnections } from './graph.ts'

/**
 * A named x/y pairing that answers a question a non-expert actually has,
 * so the landing view is a real comparison instead of two empty dropdowns.
 * `question` is the plain-language framing shown under the tabs.
 */
export interface GraphPreset {
  id: string
  label: string
  question: string
  xId: string
  yId: string
}

/**
 * The preset tabs, in tab order. Every x/y id here must exist in
 * `axisOptions` — `graphUrlState.test.ts` asserts that, so a benchmark
 * rename can't silently leave a tab pointing at a missing axis.
 */
export const graphPresets: GraphPreset[] = [
  {
    id: 'price-performance',
    label: 'Price vs performance',
    question: 'Which models give the most coding skill per dollar?',
    xId: 'price-input',
    yId: 'swe-bench-verified',
  },
  {
    id: 'price-reasoning',
    label: 'Price vs reasoning',
    question: 'Which models think hardest for the money?',
    xId: 'price-input',
    yId: 'gpqa-diamond',
  },
  {
    id: 'context-quality',
    label: 'Context vs quality',
    question: 'Which models handle the most text without giving up accuracy?',
    xId: 'context',
    yId: 'swe-bench-verified',
  },
  {
    id: 'hard-problems',
    label: 'Cost of hard problems',
    question: 'What do you pay for the models that crack the toughest exams?',
    xId: 'price-output',
    yId: 'hle',
  },
]

export type { GraphConnections }

const presetIds = new Set(graphPresets.map((p) => p.id))
const axisIds = new Set(axisOptions.map((o) => o.id))

export const defaultPresetId = graphPresets[0].id

export interface GraphUrlState {
  /** null = the axes were set by hand, so no tab is active. */
  preset: string | null
  xId: string
  yId: string
  connections: GraphConnections
  /** Whether the manual x/y controls are expanded. */
  advancedOpen: boolean
}

function parseConnections(value: string | null): GraphConnections {
  return value === 'provider' || value === 'family' || value === 'off' ? value : 'provider'
}

/**
 * Read Graph page state out of a URL query string. Unknown or malformed
 * values fall back to the defaults so stale shared links degrade gracefully.
 *
 * A recognized `preset` wins over any x/y in the URL: the tab IS the axis
 * pair, and letting the two disagree would render a chart that contradicts
 * its own highlighted tab.
 */
export function parseGraphParams(params: URLSearchParams): GraphUrlState {
  const connections = parseConnections(params.get('conn'))
  const advancedOpen = params.get('adv') === '1'

  const presetParam = params.get('preset')
  if (presetParam && presetIds.has(presetParam)) {
    const preset = graphPresets.find((p) => p.id === presetParam)!
    return { preset: preset.id, xId: preset.xId, yId: preset.yId, connections, advancedOpen }
  }

  const xParam = params.get('x')
  const yParam = params.get('y')
  // Hand-set axes only count as "manual" when BOTH are valid; a half-broken
  // link falls back to the default tab rather than a half-configured chart.
  if (xParam && yParam && axisIds.has(xParam) && axisIds.has(yParam)) {
    return { preset: null, xId: xParam, yId: yParam, connections, advancedOpen: true }
  }

  const fallback = graphPresets.find((p) => p.id === defaultPresetId)!
  return {
    preset: fallback.id,
    xId: fallback.xId,
    yId: fallback.yId,
    connections,
    advancedOpen,
  }
}

/**
 * Serialize Graph page state into query params. Defaults are omitted so the
 * canonical /graph URL stays clean. A preset serializes as just its id —
 * the axes are recoverable from it, so writing them too would let a
 * hand-edited link drift out of sync with the tab.
 */
export function serializeGraphParams(state: GraphUrlState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.preset) {
    if (state.preset !== defaultPresetId) params.set('preset', state.preset)
  } else {
    params.set('x', state.xId)
    params.set('y', state.yId)
  }
  if (state.connections !== 'provider') params.set('conn', state.connections)
  // Manual axes already imply the advanced panel is open.
  if (state.advancedOpen && state.preset) params.set('adv', '1')
  return params
}

/** The state a bare /graph URL lands on. */
export function defaultGraphState(): GraphUrlState {
  return parseGraphParams(new URLSearchParams())
}
