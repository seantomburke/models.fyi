import { useMemo, useState } from 'react'
import { Chart } from '@opendata-ai/openchart-react'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { axisOptions, buildGraphRows, buildGraphSpec, defaultYAxisId } from '../lib/graph.ts'
import type { GraphRow } from '../lib/graph.ts'

interface AxisPickerProps {
  label: string
  value: string
  onChange: (id: string) => void
}

function AxisPicker({ label, value, onChange }: AxisPickerProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-fg-muted">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {axisOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={value === opt.id}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
              value === opt.id
                ? 'bg-accent-soft font-medium text-accent-deep'
                : 'border border-line text-fg-secondary hover:border-line-strong hover:text-fg'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function Graph() {
  const meta = metaFor('/graph')
  usePageMeta(meta.title, meta.description)

  const [xId, setXId] = useState('price-input')
  const [yId, setYId] = useState(defaultYAxisId)

  const xAxis = axisOptions.find((o) => o.id === xId)!
  const yAxis = axisOptions.find((o) => o.id === yId)!

  const { rows, excluded } = useMemo(() => buildGraphRows(xAxis, yAxis), [xAxis, yAxis])

  const spec = useMemo(() => buildGraphSpec(xAxis, yAxis, rows), [rows, xAxis, yAxis])

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">See it on a graph</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Pick what each axis shows, then look for models in the sweet spot, usually{' '}
          <span className="font-medium text-fg">high on performance, low on price</span>. Hover a
          point to see which model it is.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-line bg-surface-raised p-4">
        <AxisPicker label="Horizontal axis (x)" value={xId} onChange={setXId} />
        <AxisPicker label="Vertical axis (y)" value={yId} onChange={setYId} />
      </div>

      <div className="rounded-xl border border-line bg-surface-raised p-4">
        {rows.length > 0 ? (
          <div style={{ height: 480 }}>
            <Chart<GraphRow> spec={spec} darkMode="off" />
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-fg-muted">
            No models have published data on both of those axes yet. Try a different combination.
          </p>
        )}
      </div>

      {excluded.length > 0 && (
        <p className="text-xs text-fg-muted">
          Not shown (no published data on both axes): {excluded.map((m) => m.name).join(', ')}.
        </p>
      )}
    </div>
  )
}
