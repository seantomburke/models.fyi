import { useMemo, useState } from 'react'
import { STARTER_MODEL, FULL_MODEL, END, tokenLabel } from './sceneModel'
import { buildNetwork, outputs, hidden, HIDDEN_LABELS } from './sceneNetwork'
import type { Network } from './sceneNetwork'

/** Blue people, purple verbs, gray period, matching the meaning map. */
const PERSON_FILL = '#2563eb'
const VERB_FILL = '#7c3aed'
const END_FILL = '#64748b'

const SVG_W = 560
const SVG_H = 340

function nodeColor(word: string): string {
  if (word === END) return END_FILL
  return word === 'Alice' || word === 'Bob' || word === 'Charlie' ? PERSON_FILL : VERB_FILL
}

interface Layout {
  inputY: (i: number) => number
  outputY: (i: number) => number
  hiddenY: (i: number) => number
  inputX: number
  hiddenX: number
  outputX: number
}

function makeLayout(inputCount: number, outputCount: number): Layout {
  const pad = 34
  const col = (t: number) => 70 + t * (SVG_W - 160)
  const spread = (count: number, i: number) => {
    const usable = SVG_H - pad * 2
    return pad + (usable / count) * (i + 0.5)
  }
  return {
    inputX: col(0),
    hiddenX: col(0.5),
    outputX: col(1),
    inputY: (i) => spread(inputCount, i),
    outputY: (i) => spread(outputCount, i),
    hiddenY: (i) => SVG_H / 2 + (i === 0 ? -46 : 46),
  }
}

/**
 * The Parrot-2D network drawn as a forward pass.
 *
 * The left column is one node per word, and the word you pick lights up. Its
 * one-hot signal flows into the two hidden nodes, which hold the word's two
 * numbers: friendliness on top, role on the bottom. From there the signal
 * reaches the output column, one node per possible next word plus the period,
 * and the probability bars on the right show the model's prediction. Those
 * probabilities are the corpus counts, so they match the meaning map above.
 */
export function SceneNetworkDiagram() {
  const [expanded, setExpanded] = useState(false)
  const model = expanded ? FULL_MODEL : STARTER_MODEL
  const network: Network = useMemo(() => buildNetwork(model), [model])

  const [current, setCurrent] = useState<string>('Bob')
  const active = network.inputVocab.includes(current) ? current : network.inputVocab[0]

  const h = hidden(network, active)
  const outs = outputs(network, active)
  const maxProb = Math.max(...outs.map((o) => o.prob), 0.01)

  const layout = makeLayout(network.inputVocab.length, network.outputVocab.length)
  const topWord = [...outs].sort((a, b) => b.prob - a.prob)[0]?.word

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="text-sm font-semibold text-fg">The network, one word at a time</h3>
      <p className="mt-1 text-sm text-fg-secondary">
        Pick the current word on the left. Its signal flows into the two hidden nodes, which hold its two
        numbers, and on to the outputs, where the bars show how likely each word is to come next.
      </p>

      {/* Word picker */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {network.inputVocab.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => setCurrent(word)}
            aria-pressed={word === active}
            className={`rounded-lg px-2.5 py-1 text-sm font-medium transition-colors duration-150 ${
              word === active
                ? 'text-white'
                : 'border border-line bg-surface-raised text-fg hover:border-line-strong'
            }`}
            style={word === active ? { backgroundColor: nodeColor(word) } : undefined}
          >
            {word}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="mt-4 w-full"
        role="img"
        aria-label={`Neural network with ${network.inputVocab.length} input words, two hidden nodes for friendliness and role, and output words. The current word is ${active}.`}
      >
        {/* input -> hidden edges (the fixed embedding) */}
        {network.inputVocab.map((word, i) =>
          [0, 1].map((hn) => {
            const on = word === active
            const w = network.inputWeights[word][hn]
            return (
              <line
                key={`ih-${word}-${hn}`}
                x1={layout.inputX}
                y1={layout.inputY(i)}
                x2={layout.hiddenX}
                y2={layout.hiddenY(hn)}
                stroke={w >= 0 ? PERSON_FILL : '#e0653f'}
                strokeWidth={on ? 1 + Math.abs(w) * 2 : 0.5}
                opacity={on ? 0.75 : 0.05}
                style={{ transition: 'opacity 300ms ease' }}
              />
            )
          }),
        )}

        {/* hidden -> output edges, lit for the words that can follow */}
        {network.outputVocab.map((word, i) => {
          const prob = outs.find((o) => o.word === word)?.prob ?? 0
          return [0, 1].map((hn) => (
            <line
              key={`ho-${word}-${hn}`}
              x1={layout.hiddenX}
              y1={layout.hiddenY(hn)}
              x2={layout.outputX}
              y2={layout.outputY(i)}
              stroke="var(--color-accent-deep)"
              strokeWidth={0.4 + prob * 3}
              opacity={0.06 + prob * 0.5}
              style={{ transition: 'stroke-width 250ms ease, opacity 250ms ease' }}
            />
          ))
        })}

        {/* input nodes */}
        {network.inputVocab.map((word, i) => {
          const on = word === active
          return (
            <g key={`in-${word}`}>
              <circle
                cx={layout.inputX}
                cy={layout.inputY(i)}
                r={on ? 11 : 8}
                fill={nodeColor(word)}
                opacity={on ? 1 : 0.35}
                style={{ transition: 'opacity 300ms ease, r 200ms ease' }}
              />
              <text x={layout.inputX - 16} y={layout.inputY(i) + 3.5} textAnchor="end" className="fill-fg" fontSize="10">
                {word}
              </text>
            </g>
          )
        })}

        {/* hidden nodes: the two named dimensions */}
        {[0, 1].map((hn) => {
          const value = h[hn]
          const mag = Math.min(Math.abs(value), 1)
          return (
            <g key={`hid-${hn}`}>
              <circle cx={layout.hiddenX} cy={layout.hiddenY(hn)} r={18} fill="var(--color-accent-deep)" opacity={0.2 + mag * 0.7} />
              <text x={layout.hiddenX} y={layout.hiddenY(hn) + 3.5} textAnchor="middle" fontSize="10" fontWeight={700} fill="white">
                {value.toFixed(1)}
              </text>
              <text
                x={layout.hiddenX}
                y={layout.hiddenY(hn) + (hn === 0 ? -26 : 34)}
                textAnchor="middle"
                className="fill-fg-secondary"
                fontSize="10"
              >
                {HIDDEN_LABELS[hn]}
              </text>
            </g>
          )
        })}

        {/* output nodes with probability bars */}
        {network.outputVocab.map((word, i) => {
          const prob = outs.find((o) => o.word === word)?.prob ?? 0
          const barW = (prob / maxProb) * 66
          const isTop = word === topWord
          return (
            <g key={`out-${word}`}>
              <circle cx={layout.outputX} cy={layout.outputY(i)} r={isTop ? 9 : 7} fill={nodeColor(word)} opacity={0.35 + prob * 0.65} />
              <rect
                x={layout.outputX + 12}
                y={layout.outputY(i) - 5}
                width={barW}
                height={10}
                rx={2}
                fill={nodeColor(word)}
                opacity={0.8}
                style={{ transition: 'width 250ms ease' }}
              />
              <text x={layout.outputX + 12 + barW + 5} y={layout.outputY(i) + 3.5} className="fill-fg-secondary" fontSize="9">
                {tokenLabel(word)} {Math.round(prob * 100)}%
              </text>
            </g>
          )
        })}

        {/* column labels */}
        {[
          [layout.inputX, 'current word'],
          [layout.hiddenX, 'two meanings'],
          [layout.outputX, 'next word'],
        ].map(([x, label]) => (
          <text key={label as string} x={x as number} y={SVG_H - 6} textAnchor="middle" className="fill-fg-faint" fontSize="10">
            {label}
          </text>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-pressed={expanded}
          className="rounded-lg border border-line bg-surface-raised px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-line-strong"
        >
          {expanded ? 'Back to 4 words' : 'Add Charlie and "sees"'}
        </button>
      </div>

      <p className="mt-3 text-xs text-fg-secondary">
        The left wires are the map. They copy the current word&#39;s two numbers into the hidden nodes. The
        brightness of each output bar is how often that word followed the current word in the training data, so
        the network&#39;s prediction matches the map above.
      </p>
    </div>
  )
}
