/**
 * Hardcoded "what a vision model sees" scenarios for the vision-models topic.
 *
 * A real vision model takes an image and returns structured findings: text it
 * read, objects it spotted, numbers it pulled from a chart. We can't ship real
 * photos into the Learn chunk (weight and licensing), so each scenario draws a
 * tiny schematic of the image with SVG and lists the findings a flagship model
 * would return for it. The point is the SHAPE of the output: an image goes in,
 * labelled facts come out.
 */

export type FindingKind = 'text' | 'object' | 'data'

export interface Finding {
  kind: FindingKind
  /** What the model reports for this finding. */
  label: string
}

export interface VisionScenario {
  id: string
  /** The button label and heading for this image. */
  name: string
  /** One line describing the picture, for the schematic's caption. */
  caption: string
  findings: Finding[]
}

export const SCENARIOS: VisionScenario[] = [
  {
    id: 'receipt',
    name: 'A photo of a receipt',
    caption: 'A crumpled coffee-shop receipt',
    findings: [
      { kind: 'text', label: 'Reads "Blue Bottle Coffee" at the top' },
      { kind: 'text', label: 'Reads the line item "Latte $5.50"' },
      { kind: 'data', label: 'Pulls the total: $12.75' },
      { kind: 'data', label: 'Finds the date: 2026-03-14' },
    ],
  },
  {
    id: 'chart',
    name: 'A bar chart',
    caption: 'A bar chart of quarterly revenue',
    findings: [
      { kind: 'data', label: 'Q3 is the tallest bar at ~$40M' },
      { kind: 'data', label: 'Q1 is the shortest at ~$18M' },
      { kind: 'text', label: 'Reads the axis label "Revenue (millions)"' },
      { kind: 'object', label: 'Counts four bars, one per quarter' },
    ],
  },
  {
    id: 'street',
    name: 'A street photo',
    caption: 'A busy street corner at dusk',
    findings: [
      { kind: 'object', label: 'Spots two people crossing the road' },
      { kind: 'object', label: 'Spots a red bus and three parked cars' },
      { kind: 'text', label: 'Reads the shop sign "Corner Bakery"' },
      { kind: 'text', label: 'Reads the street sign "5th Ave"' },
    ],
  },
]

export const KIND_LABEL: Record<FindingKind, string> = {
  text: 'read text',
  object: 'spotted object',
  data: 'extracted data',
}
