import { useState, useCallback } from 'react'

interface DotProductInput {
  value: number
  weight: number
}

export function WeightsExplainer() {
  const INPUT_COUNT = 4
  const [inputs, setInputs] = useState<DotProductInput[]>(
    Array.from({ length: INPUT_COUNT }, () => ({ value: 0.5, weight: 0.5 }))
  )
  const [graphedWeight, setGraphedWeight] = useState(0)

  const output = inputs.reduce((sum, inp) => sum + inp.value * inp.weight, 0)

  const handleInputChange = (index: number, newValue: number) => {
    setInputs(inputs.map((inp, i) => (i === index ? { ...inp, value: newValue } : inp)))
  }

  const handleWeightChange = (index: number, newWeight: number) => {
    setInputs(inputs.map((inp, i) => (i === index ? { ...inp, weight: newWeight } : inp)))
  }

  const handleRandomWeights = useCallback(() => {
    const updated = inputs.map((inp) => ({
      ...inp,
      weight: Math.random(),
    }))
    setInputs(updated)
  }, [inputs])

  const handleRandomAll = useCallback(() => {
    const updated = inputs.map(() => ({
      value: Math.random(),
      weight: Math.random(),
    }))
    setInputs(updated)
  }, [inputs])

  const handleReset = useCallback(() => {
    setInputs(Array.from({ length: INPUT_COUNT }, () => ({ value: 0.5, weight: 0.5 })))
  }, [])

  return (
    <div className="space-y-8">
      {/* Simple Dot Product Visualization */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h2 className="text-lg font-semibold">Interactive Dot Product</h2>
        <p className="mt-2 text-sm text-fg-secondary">
          Adjust the inputs and weights to see how they multiply and add up to create the output.
        </p>

        <div className="mt-6 space-y-6">
          {inputs.map((inp, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Input {i + 1} (a{i + 1})
                </label>
                <span className="text-sm font-mono text-accent">{inp.value.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={inp.value}
                onChange={(e) => handleInputChange(i, parseFloat(e.target.value))}
                className="w-full"
              />

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Weight {i + 1} (w{i + 1})
                </label>
                <span className="text-sm font-mono text-accent">{inp.weight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={inp.weight}
                onChange={(e) => handleWeightChange(i, parseFloat(e.target.value))}
                className="w-full"
              />

              <div className="rounded bg-bg-tertiary p-3 text-sm">
                <span className="font-mono">
                  {inp.value.toFixed(2)} × {inp.weight.toFixed(2)} = {(inp.value * inp.weight).toFixed(4)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Output */}
        <div className="mt-8 rounded-lg bg-accent-soft p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-fg-secondary">Total Output</p>
            <p className="mt-2 text-4xl font-bold text-accent">{output.toFixed(4)}</p>
            <p className="mt-1 text-xs text-fg-muted">
              ({inputs.map((_, i) => `a${i + 1}×w${i + 1}`).join(' + ')})
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleRandomWeights}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep"
          >
            Random Weights
          </button>
          <button
            onClick={handleRandomAll}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep"
          >
            Random All
          </button>
          <button
            onClick={handleReset}
            className="rounded border border-line bg-bg-tertiary px-4 py-2 text-sm font-medium hover:bg-bg-secondary"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Weight → Output Graph */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h2 className="text-lg font-semibold">How one weight moves the output</h2>
        <p className="mt-2 text-sm text-fg-secondary">
          Pick a weight, then drag its slider above. The dot slides along the line: the output changes in a
          straight line as the weight turns, and the line's steepness is that weight's input value.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {inputs.map((_, i) => (
            <button
              key={i}
              onClick={() => setGraphedWeight(i)}
              aria-pressed={graphedWeight === i}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                graphedWeight === i
                  ? 'bg-accent text-white'
                  : 'border border-line bg-bg-tertiary hover:bg-bg-secondary'
              }`}
            >
              w{i + 1}
            </button>
          ))}
        </div>

        {(() => {
          const sel = inputs[graphedWeight]
          const rest = output - sel.value * sel.weight
          const MAX_Y = INPUT_COUNT
          const xPx = (w: number) => 40 + w * 380
          const yPx = (v: number) => 200 - (v / MAX_Y) * 180
          return (
            <svg viewBox="0 0 440 240" className="mt-4 w-full" role="img" aria-label={`Graph of output as weight ${graphedWeight + 1} changes`}>
              {/* Gridlines + y labels */}
              {Array.from({ length: MAX_Y + 1 }, (_, v) => (
                <g key={v}>
                  <line x1="40" y1={yPx(v)} x2="420" y2={yPx(v)} stroke="var(--color-line)" strokeWidth="1" />
                  <text x="32" y={yPx(v) + 4} textAnchor="end" className="text-[10px]" fill="var(--color-fg-muted)">
                    {v}
                  </text>
                </g>
              ))}
              {/* X labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((w) => (
                <text key={w} x={xPx(w)} y="218" textAnchor="middle" className="text-[10px]" fill="var(--color-fg-muted)">
                  {w}
                </text>
              ))}
              <text x="230" y="236" textAnchor="middle" className="text-[11px]" fill="var(--color-fg-secondary)">
                weight w{graphedWeight + 1}
              </text>
              {/* Output line as this weight sweeps 0 → 1 */}
              <line
                x1={xPx(0)}
                y1={yPx(rest)}
                x2={xPx(1)}
                y2={yPx(rest + sel.value)}
                stroke="var(--color-accent)"
                strokeWidth="2.5"
              />
              {/* Current position */}
              <circle cx={xPx(sel.weight)} cy={yPx(output)} r="6" fill="var(--color-accent-deep)" />
              <text
                x={xPx(sel.weight)}
                y={yPx(output) - 12}
                textAnchor="middle"
                className="text-[11px] font-semibold"
                fill="var(--color-fg)"
              >
                {output.toFixed(2)}
              </text>
            </svg>
          )
        })()}

        <p className="mt-2 text-xs text-fg-muted">
          Try it: set input a{graphedWeight + 1} to 0 and the line goes flat. A weight on a zero input can't
          change anything. Set the input high and the same weight becomes a powerful dial.
        </p>
      </div>

      {/* Neural Network Visualization */}
      <div className="rounded-lg border border-line bg-bg-secondary p-6">
        <h2 className="text-lg font-semibold">Neural Network Visualization</h2>
        <p className="mt-2 text-sm text-fg-secondary">
          This is what's happening inside a neural network layer. Inputs flow through, get multiplied by
          weights, then sum up to create outputs.
        </p>

        <svg viewBox="0 0 500 300" className="mt-6 w-full" style={{ maxHeight: '300px' }}>
          {/* Input nodes */}
          <g>
            <text x="10" y="20" className="text-xs font-semibold">
              Inputs
            </text>
            {inputs.map((_, i) => (
              <circle
                key={`input-${i}`}
                cx="50"
                cy={60 + i * 60}
                r="20"
                fill="var(--color-accent)"
                opacity="0.8"
              />
            ))}
          </g>

          {/* Connection lines with weights */}
          <g stroke="var(--color-line)" strokeWidth="1" opacity="0.5">
            {inputs.map((_, i) => (
              <line
                key={`line-${i}`}
                x1="70"
                y1={60 + i * 60}
                x2="230"
                y2="150"
                strokeWidth={1 + inputs[i].weight * 3}
                opacity={0.3 + inputs[i].weight * 0.4}
              />
            ))}
          </g>

          {/* Output node */}
          <g>
            <circle cx="270" cy="150" r="25" fill="var(--color-accent-deep)" opacity="0.8" />
            <text x="270" y="155" textAnchor="middle" className="text-xs font-bold" fill="white">
              Σ
            </text>
          </g>

          {/* Output label */}
          <text x="320" y="155" className="text-sm font-medium">
            Output: {output.toFixed(2)}
          </text>
        </svg>

        <p className="mt-4 text-xs text-fg-muted">
          Thicker lines = stronger weights. The connections multiply input by weight, then everything adds up
          to the output.
        </p>
      </div>

      {/* Explanation */}
      <div className="space-y-4 rounded-lg border border-line bg-bg-secondary p-6">
        <h2 className="text-lg font-semibold">What's Happening?</h2>

        <div>
          <h3 className="font-medium">Inputs</h3>
          <p className="mt-1 text-sm text-fg-secondary">
            Each input is a number (0 to 1 in this example). In a real neural network, inputs might be pixels
            in an image, words in a sentence, or features of data.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Weights</h3>
          <p className="mt-1 text-sm text-fg-secondary">
            Weights are "dials" the network learned during training. They control how much each input matters.
            If a weight is 0, that input doesn't affect the output. If it's high, that input has a big effect.
          </p>
        </div>

        <div>
          <h3 className="font-medium">The Calculation</h3>
          <p className="mt-1 text-sm text-fg-secondary">
            For each input, we multiply it by its weight. Then we add all those products together. That sum is
            the output of this layer.
          </p>
        </div>

        <div>
          <h3 className="font-medium">Why It Matters</h3>
          <p className="mt-1 text-sm text-fg-secondary">
            During training, the network adjusts millions of weights until they're "just right" for the task.
            Better weights = better predictions. That's the whole game.
          </p>
        </div>
      </div>
    </div>
  )
}
