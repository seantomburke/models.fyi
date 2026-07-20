import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePostHog } from '../lib/posthog-react.ts'
import { GraphModelSelector, GraphScatter } from '../components/GraphScatter.tsx'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { axisOptions, buildGraphRows, providerColor } from '../lib/graph.ts'
import type { AxisOption, GraphConnections, GraphRow } from '../lib/graph.ts'
import {
  graphPresets,
  parseGraphParams,
  serializeGraphParams,
} from '../lib/graphUrlState.ts'
import type { GraphUrlState } from '../lib/graphUrlState.ts'
import { captureGraphAxesChange, captureGraphPointSelected } from '../lib/posthog-events.ts'
import { Breadcrumb } from '../components/Breadcrumb.tsx'

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

interface PresetTabsProps {
  value: string | null
  onChange: (id: string) => void
}

/**
 * The preset views, as a real ARIA tablist.
 *
 * Roving tabindex: exactly one tab is in the tab order at a time and the
 * arrow keys move between them, which is what the tablist pattern requires —
 * leaving every tab tabbable would make a keyboard user press Tab four times
 * to get past the strip.
 */
export function PresetTabs({ value, onChange }: PresetTabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  // With hand-set axes no tab is selected, but one still has to be reachable.
  const activeIndex = Math.max(
    0,
    graphPresets.findIndex((p) => p.id === value),
  )

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    let next: number
    if (delta !== 0) {
      next = (index + delta + graphPresets.length) % graphPresets.length
    } else if (e.key === 'Home') {
      next = 0
    } else if (e.key === 'End') {
      next = graphPresets.length - 1
    } else {
      return
    }
    e.preventDefault()
    onChange(graphPresets[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label="Preset views" className="flex flex-wrap gap-1.5">
      {graphPresets.map((preset, i) => {
        const selected = preset.id === value
        return (
          <button
            key={preset.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`graph-tab-${preset.id}`}
            aria-selected={selected}
            aria-controls="graph-panel"
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => onChange(preset.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
              selected
                ? 'bg-accent-soft font-medium text-accent-deep'
                : 'border border-line text-fg-secondary hover:border-line-strong hover:text-fg'
            }`}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}

interface ConnectionPickerProps {
  value: GraphConnections
  onChange: (value: GraphConnections) => void
}

const connectionOptions: Array<{ id: GraphConnections; label: string; hint: string }> = [
  { id: 'provider', label: 'By company', hint: 'Joins every model from the same company.' },
  { id: 'family', label: 'By model family', hint: 'Joins variants of one release, cheapest first.' },
  { id: 'off', label: 'None', hint: 'Just the points.' },
]

/** Chooses which related points get joined by a dotted line. */
export function ConnectionPicker({ value, onChange }: ConnectionPickerProps) {
  const active = connectionOptions.find((o) => o.id === value)!
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Connect points
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {connectionOptions.map((opt) => (
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
      <p className="mt-1.5 text-xs text-fg-muted">{active.hint}</p>
    </fieldset>
  )
}

interface SelectedPointProps {
  row: GraphRow | null
  xAxis: AxisOption
  yAxis: AxisOption
  onDismiss: () => void
}

/**
 * Details for the last tapped point. Tooltips need a precise hover, which is
 * hard on touch screens, so tapping pins the point's details here instead.
 */
export function SelectedPoint({ row, xAxis, yAxis, onDismiss }: SelectedPointProps) {
  return (
    <div aria-live="polite">
      {!row ? (
        <p className="mt-3 text-center text-xs text-fg-muted">
          Tap or click a point to pin its details here.
        </p>
      ) : (
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
            {xAxis.axisTitle}: <span className="font-medium text-fg">{row.x}</span>
          </span>
          <span className="text-fg-secondary">
            {yAxis.axisTitle}: <span className="font-medium text-fg">{row.y}</span>
          </span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Clear pinned point"
            className="ml-auto self-center rounded p-1 leading-none text-fg-muted transition-colors duration-150 hover:text-fg"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

export function Graph() {
  const posthog = usePostHog()
  const meta = metaFor('/graph')
  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/graph',
    structuredData: meta.structuredData,
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const state = parseGraphParams(searchParams)
  const [selected, setSelected] = useState<GraphRow | null>(null)

  // A pinned point's values only make sense for the axes it was tapped on, so
  // any change that moves the axes clears it.
  const patchState = (patch: Partial<GraphUrlState>) => {
    setSearchParams(
      (prev) => serializeGraphParams({ ...parseGraphParams(prev), ...patch }),
      { replace: true },
    )
  }

  const changePreset = (id: string) => {
    const preset = graphPresets.find((p) => p.id === id)!
    patchState({ preset: preset.id, xId: preset.xId, yId: preset.yId })
    setSelected(null)
    captureGraphAxesChange(posthog, 'x', preset.xId)
    captureGraphAxesChange(posthog, 'y', preset.yId)
  }

  // Hand-setting an axis drops out of preset mode: the chart no longer matches
  // any tab, so leaving one highlighted would misdescribe what's on screen.
  const changeX = (id: string) => {
    patchState({ preset: null, xId: id, yId: state.yId })
    setSelected(null)
    captureGraphAxesChange(posthog, 'x', id)
  }
  const changeY = (id: string) => {
    patchState({ preset: null, xId: state.xId, yId: id })
    setSelected(null)
    captureGraphAxesChange(posthog, 'y', id)
  }

  const changeConnections = (connections: GraphConnections) => patchState({ connections })

  const handlePointSelected = (row: GraphRow) => {
    setSelected(row)
    captureGraphPointSelected(posthog, row.model, row.provider, row.x, row.y)
  }

  const xAxis = axisOptions.find((o) => o.id === state.xId)!
  const yAxis = axisOptions.find((o) => o.id === state.yId)!
  const activePreset = graphPresets.find((p) => p.id === state.preset) ?? null

  const { rows, excluded } = useMemo(
    () => buildGraphRows(xAxis, yAxis, state.connections),
    [xAxis, yAxis, state.connections],
  )

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'Graph' },
        ]}
        className="mb-4"
      />
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">See it on a graph</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Start with one of the views below, then look for models in the sweet spot, usually{' '}
          <span className="font-medium text-fg">high on performance, low on price</span>. Tap or
          hover a point to see which model it is.
        </p>
      </div>

      <div className="space-y-3">
        <PresetTabs value={state.preset} onChange={changePreset} />
        <p className="text-sm text-fg-secondary">
          {activePreset
            ? activePreset.question
            : `Custom view: ${xAxis.label} against ${yAxis.label}.`}
        </p>
      </div>

      <div
        id="graph-panel"
        role="tabpanel"
        aria-labelledby={activePreset ? `graph-tab-${activePreset.id}` : undefined}
        tabIndex={0}
        className="rounded-xl border border-line bg-surface-raised p-4"
      >
        {rows.length > 0 ? (
          <>
            <div style={{ height: 480 }}>
              <GraphScatter
                rows={rows}
                xAxis={xAxis}
                yAxis={yAxis}
                connections={state.connections}
                onPointSelected={handlePointSelected}
              />
            </div>
            <GraphModelSelector
              rows={rows}
              xAxis={xAxis}
              yAxis={yAxis}
              onPointSelected={handlePointSelected}
            />
            <SelectedPoint row={selected} xAxis={xAxis} yAxis={yAxis} onDismiss={() => setSelected(null)} />
          </>
        ) : (
          <p className="py-16 text-center text-sm text-fg-muted">
            No models have published data on both of those axes yet. Try a different combination.
          </p>
        )}
      </div>

      <details
        open={state.advancedOpen}
        onToggle={(e) => patchState({ advancedOpen: (e.currentTarget as HTMLDetailsElement).open })}
        className="rounded-xl border border-line bg-surface-raised"
      >
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-fg-secondary transition-colors duration-150 hover:text-fg">
          Advanced: choose your own axes
        </summary>
        <div className="space-y-4 border-t border-line p-4">
          <AxisPicker label="Horizontal axis (x)" value={state.xId} onChange={changeX} />
          <AxisPicker label="Vertical axis (y)" value={state.yId} onChange={changeY} />
          <ConnectionPicker value={state.connections} onChange={changeConnections} />
        </div>
      </details>

      {excluded.length > 0 && (
        <p className="text-xs text-fg-muted">
          Not shown (no published data on both axes): {excluded.map((m) => m.name).join(', ')}.
        </p>
      )}
    </div>
  )
}
