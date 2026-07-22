import { placeLabels } from './graphLabels'
import type { LabelInput, PlacedLabel } from './graphLabels'

const ASPECT = 2

/** Overlap test mirroring the module's padded box collision, minus the pad —
 * shown labels must be clear of each other even without breathing room. */
function boxesOverlap(a: PlacedLabel, b: PlacedLabel): boolean {
  return (
    a.left < b.left + b.width &&
    a.left + a.width > b.left &&
    a.top < b.top + b.height &&
    a.top + a.height > b.top
  )
}

test('a lone point gets its label at the default right anchor with no leader', () => {
  const [label] = placeLabels([{ id: 'a', text: 'Opus 4.8', x: 50, y: 50 }])
  expect(label).toBeDefined()
  expect(label.leader).toBe(false)
  expect(label.left).toBeGreaterThan(50)
  // Vertically centered on the point.
  expect(label.top + label.height / 2).toBeCloseTo(50, 5)
})

test('placement is deterministic: same input, same output', () => {
  const inputs: LabelInput[] = [
    { id: 'a', text: 'Opus 4.8', x: 40, y: 40 },
    { id: 'b', text: 'Sonnet 5', x: 42, y: 41 },
    { id: 'c', text: 'Haiku 4.5', x: 44, y: 42 },
  ]
  expect(placeLabels(inputs)).toEqual(placeLabels(inputs))
})

test('crowded points reposition their labels rather than overlapping', () => {
  // A tight cluster: default right-side anchors would all overprint.
  const inputs: LabelInput[] = [
    { id: 'a', text: 'Opus 4.8', x: 50, y: 50 },
    { id: 'b', text: 'Sonnet 5', x: 51, y: 50.5 },
    { id: 'c', text: 'Haiku 4.5', x: 52, y: 51 },
    { id: 'd', text: 'GPT-5.6 Sol', x: 50.5, y: 51.5 },
  ]
  const labels = placeLabels(inputs)
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      expect(
        boxesOverlap(labels[i], labels[j]),
        `${labels[i].id} overlaps ${labels[j].id}`,
      ).toBe(false)
    }
  }
  // At least one label had to move off its default anchor and gets a leader.
  expect(labels.some((l) => l.leader)).toBe(true)
})

test('the leader flag marks exactly the labels that left their default anchor', () => {
  // Two coincident points: the first takes the default right slot, the
  // second must move somewhere else and flag the displacement.
  const labels = placeLabels([
    { id: 'a', text: 'Alpha', x: 50, y: 50 },
    { id: 'b', text: 'Beta', x: 50, y: 50 },
  ])
  const alpha = labels.find((l) => l.id === 'a')!
  expect(alpha.leader).toBe(false)
  // The default anchor: box starts just right of the point, centered on it.
  expect(alpha.left).toBeGreaterThan(50)
  expect(alpha.top + alpha.height / 2).toBeCloseTo(50, 5)
  const beta = labels.find((l) => l.id === 'b')!
  expect(beta.leader).toBe(true)
})

test('labels never cross the plot boundary', () => {
  const inputs: LabelInput[] = [
    { id: 'edge-right', text: 'A very long model name', x: 99, y: 50 },
    { id: 'edge-left', text: 'Another long name', x: 1, y: 50 },
    { id: 'edge-top', text: 'Top', x: 50, y: 0.5 },
    { id: 'edge-bottom', text: 'Bottom', x: 50, y: 99.5 },
  ]
  for (const label of placeLabels(inputs)) {
    expect(label.left).toBeGreaterThanOrEqual(0)
    expect(label.left + label.width).toBeLessThanOrEqual(100)
    expect(label.top).toBeGreaterThanOrEqual(0)
    expect(label.top + label.height).toBeLessThanOrEqual(100)
  }
})

test('hiding is a last resort: an impossible pile drops labels instead of stacking them', () => {
  // Twelve identical points: no arrangement can show twelve labels around
  // one spot without overlap, so some must be hidden — but at least one
  // shows, and the shown ones stay clear of each other.
  const inputs: LabelInput[] = Array.from({ length: 12 }, (_, i) => ({
    id: `m${i}`,
    text: `Model ${i}`,
    x: 50,
    y: 50,
  }))
  const labels = placeLabels(inputs)
  expect(labels.length).toBeGreaterThan(0)
  expect(labels.length).toBeLessThan(inputs.length)
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      expect(boxesOverlap(labels[i], labels[j])).toBe(false)
    }
  }
})

test('well-spread points all keep visible labels', () => {
  const inputs: LabelInput[] = [
    { id: 'a', text: 'Opus 4.8', x: 20, y: 20 },
    { id: 'b', text: 'Sonnet 5', x: 70, y: 30 },
    { id: 'c', text: 'Gemini 3.1 Pro', x: 40, y: 70 },
    { id: 'd', text: 'Grok 4.5', x: 80, y: 80 },
  ]
  const labels = placeLabels(inputs)
  expect(labels).toHaveLength(inputs.length)
  expect(labels.every((l) => !l.leader)).toBe(true)
})

test('a displaced label anchors its leader on the box edge facing the point', () => {
  const inputs: LabelInput[] = [
    { id: 'a', text: 'Alpha model', x: 50, y: 50 },
    { id: 'b', text: 'Beta model', x: 53, y: 50 },
    { id: 'c', text: 'Gamma model', x: 56, y: 50 },
  ]
  const labels = placeLabels(inputs, { aspectRatio: ASPECT })
  for (const label of labels.filter((l) => l.leader)) {
    // The attachment point sits on the label box perimeter.
    const onVerticalEdge =
      (label.anchorX === label.left || label.anchorX === label.left + label.width) &&
      label.anchorY >= label.top &&
      label.anchorY <= label.top + label.height
    const onHorizontalEdge =
      (label.anchorY === label.top || label.anchorY === label.top + label.height) &&
      label.anchorX >= label.left &&
      label.anchorX <= label.left + label.width
    expect(onVerticalEdge || onHorizontalEdge).toBe(true)
  }
})

test('longer text yields a wider estimated box', () => {
  const [short] = placeLabels([{ id: 's', text: 'K3', x: 50, y: 50 }])
  const [long] = placeLabels([{ id: 'l', text: 'Gemini 3.5 Flash-Lite', x: 50, y: 50 }])
  expect(long.width).toBeGreaterThan(short.width)
})
