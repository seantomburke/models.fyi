import { useMemo, useState } from 'react'
import { Chart } from '@opendata-ai/openchart-react'
import '@opendata-ai/openchart-react/styles.css'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { axisOptions, buildGraphRows, buildGraphSpec, defaultYAxisId, providerColor } from '../lib/graph.ts'
import type { AxisOption, GraphRow } from '../lib/graph.ts'

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

interface SelectedPointProps {
  row: GraphRow | null
  xAxis: AxisOption
  yAxis: AxisOption
}

/**
 * Details for the last tapped point. Tooltips need a precise hover, which is
 * hard on touch screens, so tapping pins the point's details here instead.
 */
export function SelectedPoint({ row, xAxis, yAxis }: SelectedPointProps) {
  if (!row) {
    return (
      <p className="mt-3 text-center text-xs text-fg-muted">
        Tap or click a point to pin its details here.
      </p>
    )
  }
  return (
    <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg bg-surface px-3 py-2 text-sm">
      <span className="flex items-center gap-2 font-medium text-fg">
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: providerColor(row.provider) }}
        />
        {row.model}
      </span>
      <span className="text-fg-muted">{row.provider}</span>
      <span className="text-fg-secondary">
        {xAxis.label}: <span className="font-medium text-fg">{row.x}</span>
      </span>
      <span className="text-fg-secondary">
        {yAxis.label}: <span className="font-medium text-fg">{row.y}</span>
      </span>
    </div>
  )
}

export function Graph() {
  const meta = metaFor('/graph')
  usePageMeta(meta.title, meta.description)

  const [xId, setXId] = useState('price-input')
  const [yId, setYId] = useState(defaultYAxisId)
  const [selected, setSelected] = useState<GraphRow | null>(null)

  // A pinned point's values only make sense for the axes it was tapped on.
  const changeX = (id: string) => {
    setXId(id)
    setSelected(null)
  }
  const changeY = (id: string) => {
    setYId(id)
    setSelected(null)
  }

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
          <span className="font-medium text-fg">high on performance, low on price</span>. Tap or
          hover a point to see which model it is.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-line bg-surface-raised p-4">
        <AxisPicker label="Horizontal axis (x)" value={xId} onChange={changeX} />
        <AxisPicker label="Vertical axis (y)" value={yId} onChange={changeY} />
      </div>

      <div className="rounded-xl border border-line bg-surface-raised p-4">
        {rows.length > 0 ? (
          <>
            <div style={{ height: 480 }}>
              <Chart<GraphRow>
                spec={spec}
                darkMode="off"
                onMarkClick={(e) => setSelected(e.datum as GraphRow)}
              />
            </div>
            <SelectedPoint row={selected} xAxis={xAxis} yAxis={yAxis} />
          </>
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
