import { useState } from 'react'
import {
  SCENARIOS,
  KIND_LABEL,
  type FindingKind,
  type VisionScenario,
} from './visionModel'

/**
 * Interactive "what the model sees" demo for the vision-models topic.
 *
 * The reader picks an image scenario and sees the model's findings: text it
 * read, objects it spotted, data it pulled from a chart. The schematic on the
 * left stands in for the photo; the list on the right is the structured
 * output. The lesson is the shape of it. An image goes in and labelled facts
 * come out, whatever the picture happens to be.
 */

/** Fixed light chip colors per finding kind, readable in both themes. */
const KIND_STYLE: Record<FindingKind, { backgroundColor: string; color: string }> = {
  text: { backgroundColor: '#BFDBFE', color: '#1e3a8a' },
  object: { backgroundColor: '#BBF7D0', color: '#14532d' },
  data: { backgroundColor: '#FDE68A', color: '#78350f' },
}

/** A tiny schematic per scenario so the reader has an image to look at. */
function Schematic({ scenario }: { scenario: VisionScenario }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-40 w-full rounded-md border border-line bg-surface-raised"
      role="img"
      aria-label={scenario.caption}
    >
      {scenario.id === 'receipt' && (
        <g className="stroke-fg-secondary/60" fill="none" strokeWidth={1.4}>
          <rect x={32} y={12} width={36} height={76} rx={2} className="fill-surface" />
          <line x1={38} y1={24} x2={62} y2={24} />
          <line x1={38} y1={36} x2={62} y2={36} />
          <line x1={38} y1={44} x2={58} y2={44} />
          <line x1={38} y1={52} x2={60} y2={52} />
          <line x1={38} y1={70} x2={62} y2={70} strokeWidth={2.2} />
        </g>
      )}
      {scenario.id === 'chart' && (
        <g className="fill-accent-deep/70">
          <rect x={22} y={58} width={12} height={26} />
          <rect x={38} y={40} width={12} height={44} />
          <rect x={54} y={26} width={12} height={58} />
          <rect x={70} y={48} width={12} height={36} />
          <line x1={18} y1={84} x2={86} y2={84} className="stroke-fg-secondary/60" strokeWidth={1.2} />
        </g>
      )}
      {scenario.id === 'street' && (
        <g>
          <rect x={0} y={64} width={100} height={36} className="fill-fg-secondary/15" />
          <rect x={14} y={44} width={22} height={20} rx={2} className="fill-accent-deep/50" />
          <circle cx={19} cy={66} r={4} className="fill-fg-secondary/70" />
          <circle cx={31} cy={66} r={4} className="fill-fg-secondary/70" />
          <circle cx={58} cy={54} r={5} className="fill-fg-secondary/60" />
          <circle cx={70} cy={54} r={5} className="fill-fg-secondary/60" />
          <rect x={80} y={40} width={14} height={24} rx={2} className="fill-fg-secondary/40" />
        </g>
      )}
    </svg>
  )
}

export function VisionCapabilityDemo() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)

  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0]

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-fg">Hand the model an image</h3>
        <div className="flex flex-wrap gap-2" role="group" aria-label="image choices">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenarioId(s.id)}
              aria-pressed={s.id === scenario.id}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                s.id === scenario.id
                  ? 'border-accent-deep bg-accent-soft text-accent-deep'
                  : 'border-line bg-surface-raised text-fg hover:border-line-strong'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-fg">The picture</h3>
          <Schematic scenario={scenario} />
          <p className="text-xs text-fg-secondary">{scenario.caption}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-fg">What the model reports back</h3>
          <ul className="space-y-1.5">
            {scenario.findings.map((f) => (
              <li
                key={f.label}
                className="flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2"
                aria-label={`${KIND_LABEL[f.kind]}: ${f.label}`}
              >
                <span
                  className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={KIND_STYLE[f.kind]}
                >
                  {KIND_LABEL[f.kind]}
                </span>
                <span className="text-sm text-fg">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-sm text-fg-secondary">
        Same model, different image, same shape of answer: it reads any text, names the objects,
        and pulls the numbers. All of that was learned from examples during training. None of it
        was hand-coded for this picture.
      </p>
    </div>
  )
}
