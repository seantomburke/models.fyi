import { useEffect, useMemo, useState } from 'react'
import { Chart } from '@opendata-ai/openchart-react'
import '@opendata-ai/openchart-react/styles.css'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor } from '../lib/routeMeta.ts'
import { formatCost } from '../lib/format.ts'
import { buildCostRows, effortPresets } from '../lib/pricing.ts'
import type { CostRow, EffortId } from '../lib/pricing.ts'
import {
  buildPriceRows,
  buildPriceSpec,
  buildTotalCostRows,
  buildTotalCostSpec,
} from '../lib/priceChart.ts'
import { estimateTokens, loadTokenizer } from '../lib/tokenize.ts'
import type { TokenCounter } from '../lib/tokenize.ts'
import { ProviderLogo } from '../components/ProviderLogo.tsx'

/** Editable stand-in for a typical model reply, so the page shows real costs immediately. */
export const SAMPLE_OUTPUT = `Here's a summary of the main trade-offs. Flagship models give you the best answers on hard problems, but you pay a premium for every token, and reasoning models quietly add "thinking" tokens on top of the reply you see. Balanced models handle most everyday work — drafting, summarizing, light coding — at a fraction of the price. Fast models are almost free and respond instantly, which makes them the right choice for high-volume tasks like tagging or extraction where a slightly rougher answer is fine.

A good rule of thumb: start with a balanced model, move up only when you can point to answers it got wrong, and move down when you stop noticing a difference. For most people, the expensive model is only worth it on the handful of tasks where quality visibly pays for itself.`

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

interface TokenTextareaProps {
  id: string
  label: string
  hint: string
  value: string
  onChange: (value: string) => void
  tokens: number
  estimated: boolean
  placeholder?: string
}

function TokenTextarea({
  id,
  label,
  hint,
  value,
  onChange,
  tokens,
  estimated,
  placeholder,
}: TokenTextareaProps) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums text-fg-muted">
          {`${tokens.toLocaleString()} tokens${estimated ? ' (estimated)' : ''}`}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-fg-muted">{hint}</p>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-lg border border-line bg-surface p-3 font-mono text-sm text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none"
      />
    </div>
  )
}

interface EffortPickerProps {
  value: EffortId
  onChange: (id: EffortId) => void
}

function EffortPicker({ value, onChange }: EffortPickerProps) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-fg-muted">
        Thinking effort (reasoning models)
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {effortPresets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={value === p.id}
            title={p.blurb}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors duration-150 ${
              value === p.id
                ? 'bg-accent-soft font-medium text-accent-deep'
                : 'border border-line text-fg-secondary hover:border-line-strong hover:text-fg'
            }`}
          >
            {p.label} <span className="font-mono text-xs">{p.multiplier}×</span>
          </button>
        ))}
      </div>
      <p className="mt-1.5 max-w-2xl text-xs text-fg-muted">
        Reasoning models think step by step before answering, and providers bill those hidden
        thinking tokens at the same rate as the reply itself. Higher effort means better answers
        on hard problems — and more tokens on the bill.
      </p>
    </fieldset>
  )
}

type SortKey = 'model' | 'inputCost' | 'outputCost' | 'totalCost'
interface SortState {
  key: SortKey
  dir: 'asc' | 'desc'
}

interface SortHeaderProps {
  label: string
  sortKey: SortKey
  sort: SortState
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
  title?: string
}

function SortHeader({ label, sortKey, sort, onSort, align = 'right', title }: SortHeaderProps) {
  const active = sort.key === sortKey
  return (
    <th
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
      className={`px-3 py-3 font-medium text-fg-muted ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        title={title}
        className="inline-flex items-center gap-1 transition-colors duration-150 hover:text-fg"
      >
        {label}
        <span aria-hidden className="w-3 text-xs">
          {active ? (sort.dir === 'asc' ? '↑' : '↓') : ''}
        </span>
      </button>
    </th>
  )
}

interface CalculatorProps {
  /** Token counts wait this long after the last keystroke. Tests pass 0. */
  debounceMs?: number
}

export function Calculator({ debounceMs = 200 }: CalculatorProps) {
  const meta = metaFor('/calculator')
  usePageMeta(meta.title, meta.description)

  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState(SAMPLE_OUTPUT)
  const [effort, setEffort] = useState<EffortId>('medium')
  const [counter, setCounter] = useState<TokenCounter | null>(null)
  const [sort, setSort] = useState<SortState>({ key: 'totalCost', dir: 'asc' })

  // The real tokenizer is a large lazy chunk; until it lands (and during
  // prerender, where effects never run) counts fall back to the estimate.
  useEffect(() => {
    let cancelled = false
    loadTokenizer()
      .then((count) => {
        if (!cancelled) setCounter(() => count)
      })
      .catch((error: unknown) => {
        console.error('Tokenizer failed to load; keeping the character-based estimate.', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const count = counter ?? estimateTokens
  const debouncedInput = useDebouncedValue(inputText, debounceMs)
  const debouncedOutput = useDebouncedValue(outputText, debounceMs)
  const inputTokens = useMemo(() => count(debouncedInput), [count, debouncedInput])
  const outputTokens = useMemo(() => count(debouncedOutput), [count, debouncedOutput])

  const multiplier = effortPresets.find((p) => p.id === effort)!.multiplier
  const { rows: costRows, excluded } = useMemo(
    () => buildCostRows(inputTokens, outputTokens, multiplier),
    [inputTokens, outputTokens, multiplier],
  )

  const sortedRows = useMemo(() => {
    const sorted = [...costRows].sort((a, b) =>
      sort.key === 'model' ? a.model.localeCompare(b.model) : a[sort.key] - b[sort.key],
    )
    return sort.dir === 'asc' ? sorted : sorted.reverse()
  }, [costRows, sort])

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    )

  const priceChart = useMemo(() => {
    const { rows } = buildPriceRows()
    return { rows, spec: buildPriceSpec(rows) }
  }, [])

  const totalCostChart = useMemo(() => {
    const rows = buildTotalCostRows(costRows)
    return { rows, spec: buildTotalCostSpec(rows) }
  }, [costRows])
  const hasCosts = totalCostChart.rows.some((r) => r.cost > 0)

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">What does a conversation cost?</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Models charge per <span className="font-medium text-fg">token</span> — a chunk of text
          about four characters long — with separate rates for the text you send (input) and the
          text you get back (output). Compare the rates below, then paste your own text to see
          what it would cost on every model.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Price per million tokens</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-fg-secondary">
          Output tokens cost several times more than input tokens on every model. Open-source
          models aren't shown — they're free to download, so there's no fixed per-token price.
        </p>
        <div className="rounded-xl border border-line bg-surface-raised p-4">
          <div style={{ height: 560 }}>
            <Chart spec={priceChart.spec} darkMode="off" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Cost calculator</h2>
        <div className="space-y-4 rounded-xl border border-line bg-surface-raised p-4">
          <TokenTextarea
            id="calculator-input"
            label="Your input"
            hint="What you'd send the model: a question, a document, a prompt."
            placeholder="Paste or type the text you'd send to the model…"
            value={inputText}
            onChange={setInputText}
            tokens={inputTokens}
            estimated={counter === null}
          />
          <TokenTextarea
            id="calculator-output"
            label="Example output"
            hint="A stand-in for the model's reply — edit it to match how long you expect answers to be."
            value={outputText}
            onChange={setOutputText}
            tokens={outputTokens}
            estimated={counter === null}
          />
          <EffortPicker value={effort} onChange={setEffort} />
          <p className="text-xs text-fg-muted">
            Token counts use OpenAI's o200k tokenizer. Other providers split text slightly
            differently, so treat their counts as close approximations.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          What this conversation costs, model by model
        </h2>
        <div className="overflow-x-auto rounded-xl border border-line bg-surface-raised">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <SortHeader label="Model" sortKey="model" sort={sort} onSort={toggleSort} align="left" />
                <SortHeader
                  label="Input cost"
                  sortKey="inputCost"
                  sort={sort}
                  onSort={toggleSort}
                  title={`${inputTokens.toLocaleString()} input tokens at the model's input rate`}
                />
                <SortHeader
                  label="Output cost"
                  sortKey="outputCost"
                  sort={sort}
                  onSort={toggleSort}
                  title="Visible reply plus hidden thinking tokens, billed at the output rate"
                />
                <SortHeader label="Total" sortKey="totalCost" sort={sort} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sortedRows.map((r: CostRow) => (
                <tr key={r.modelId}>
                  <td className="px-3 py-3">
                    <div className="font-medium text-fg">{r.model}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-muted">
                      <ProviderLogo providerId={r.providerId} size={12} className="shrink-0" />
                      {r.provider}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-fg-secondary">
                    {formatCost(r.inputCost)}
                  </td>
                  <td
                    className="px-3 py-3 text-right font-mono tabular-nums text-fg-secondary"
                    title={`${outputTokens.toLocaleString()} visible + ${r.thinkingTokens.toLocaleString()} thinking tokens`}
                  >
                    {formatCost(r.outputCost)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-semibold tabular-nums text-fg">
                    {formatCost(r.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-line bg-surface-raised p-4">
          {hasCosts ? (
            <div style={{ height: 440 }}>
              <Chart spec={totalCostChart.spec} darkMode="off" />
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-fg-muted">
              Type or paste some text above to see total costs charted here.
            </p>
          )}
        </div>

        {excluded.length > 0 && (
          <p className="text-xs text-fg-muted">
            Not shown ({excluded.map((m) => m.name).join(', ')}): open-source models are free to
            download and run on your own hardware, so there's no fixed per-token price to
            calculate. Hosted-API pricing for them varies by vendor.
          </p>
        )}
      </section>
    </div>
  )
}
