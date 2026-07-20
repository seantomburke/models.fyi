import {
  defaultGraphState,
  defaultPresetId,
  graphPresets,
  parseGraphParams,
  serializeGraphParams,
} from './graphUrlState.ts'
import type { GraphUrlState } from './graphUrlState.ts'
import { axisOptions } from './graph.ts'

test('every preset points at axes that actually exist', () => {
  const ids = new Set(axisOptions.map((o) => o.id))
  for (const preset of graphPresets) {
    expect(ids.has(preset.xId)).toBe(true)
    expect(ids.has(preset.yId)).toBe(true)
  }
})

test('presets have unique ids and human-readable labels', () => {
  expect(new Set(graphPresets.map((p) => p.id)).size).toBe(graphPresets.length)
  for (const preset of graphPresets) {
    expect(preset.label).not.toBe('')
    expect(preset.question).toMatch(/\?$/)
  }
})

test('empty params land on the first preset with connections on', () => {
  const state = parseGraphParams(new URLSearchParams())
  const first = graphPresets[0]
  expect(state.preset).toBe(first.id)
  expect(state.xId).toBe(first.xId)
  expect(state.yId).toBe(first.yId)
  expect(state.connections).toBe('provider')
  expect(state.advancedOpen).toBe(false)
})

test('the default state serializes to an empty query string', () => {
  expect(serializeGraphParams(defaultGraphState()).toString()).toBe('')
})

test('a non-default preset round-trips through the URL', () => {
  const preset = graphPresets[2]
  const params = serializeGraphParams({
    preset: preset.id,
    xId: preset.xId,
    yId: preset.yId,
    connections: 'provider',
    advancedOpen: false,
  })
  expect(params.get('preset')).toBe(preset.id)
  const parsed = parseGraphParams(params)
  expect(parsed.preset).toBe(preset.id)
  expect(parsed.xId).toBe(preset.xId)
  expect(parsed.yId).toBe(preset.yId)
})

test('a preset serializes as its id alone, not as x/y', () => {
  const preset = graphPresets[1]
  const params = serializeGraphParams({
    preset: preset.id,
    xId: preset.xId,
    yId: preset.yId,
    connections: 'provider',
    advancedOpen: false,
  })
  expect(params.has('x')).toBe(false)
  expect(params.has('y')).toBe(false)
})

test('hand-set axes round-trip and clear the preset', () => {
  const state: GraphUrlState = {
    preset: null,
    xId: 'context',
    yId: 'hle',
    connections: 'family',
    advancedOpen: true,
  }
  expect(parseGraphParams(serializeGraphParams(state))).toEqual(state)
})

test('a recognized preset wins over conflicting x/y in the URL', () => {
  const preset = graphPresets[1]
  const state = parseGraphParams(
    new URLSearchParams(`preset=${preset.id}&x=context&y=hle`),
  )
  // The tab IS the axis pair; a chart contradicting its own highlighted tab
  // would be worse than ignoring the stray params.
  expect(state.preset).toBe(preset.id)
  expect(state.xId).toBe(preset.xId)
  expect(state.yId).toBe(preset.yId)
})

test('every connection mode round-trips', () => {
  for (const connections of ['off', 'provider', 'family'] as const) {
    const params = serializeGraphParams({
      preset: defaultPresetId,
      xId: graphPresets[0].xId,
      yId: graphPresets[0].yId,
      connections,
      advancedOpen: false,
    })
    expect(parseGraphParams(params).connections).toBe(connections)
  }
})

test('the advanced-open flag round-trips alongside a preset', () => {
  const params = serializeGraphParams({
    preset: defaultPresetId,
    xId: graphPresets[0].xId,
    yId: graphPresets[0].yId,
    connections: 'provider',
    advancedOpen: true,
  })
  expect(params.get('adv')).toBe('1')
  expect(parseGraphParams(params).advancedOpen).toBe(true)
})

test('manual axes imply an open advanced panel without needing the adv param', () => {
  const state = parseGraphParams(new URLSearchParams('x=context&y=hle'))
  expect(state.advancedOpen).toBe(true)
  // ...and serializing back does not add a redundant adv=1.
  expect(serializeGraphParams(state).has('adv')).toBe(false)
})

test('unknown preset, axis, and connection values fall back to defaults', () => {
  const state = parseGraphParams(
    new URLSearchParams('preset=vibes&x=astrology&y=hle&conn=telepathy'),
  )
  expect(state.preset).toBe(defaultPresetId)
  expect(state.connections).toBe('provider')
})

test('a half-valid axis pair falls back to the default preset', () => {
  // Only x is real. Honoring it alone would render a half-configured chart.
  const state = parseGraphParams(new URLSearchParams('x=context&y=not-an-axis'))
  expect(state.preset).toBe(defaultPresetId)
  expect(state.xId).toBe(graphPresets[0].xId)
})
