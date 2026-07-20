import type { Model, Benchmark } from '../../data/types'

interface Props {
  model: Model
  relevantBenchmarks: Benchmark[]
}

function formatPrice(price: number | null): string {
  if (price === null) return 'N/A'
  if (price < 0.01) return `<$0.01`
  return `$${price.toFixed(2)}`
}

function formatNumber(value: number | null): string {
  if (value === null) return 'Not published'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M tokens`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K tokens`
  return `${value} tokens`
}

export function ModelSpecs({ model, relevantBenchmarks }: Props) {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-fg mb-4">Pricing</h2>
        <div className="space-y-3 bg-surface-raised border border-line rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-fg-muted">Input tokens</span>
            <span className="font-medium text-fg">
              {formatPrice(model.inputPricePerMTok)}/M
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-fg-muted">Output tokens</span>
            <span className="font-medium text-fg">
              {formatPrice(model.outputPricePerMTok)}/M
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-fg mb-4">Capacity</h2>
        <div className="space-y-3 bg-surface-raised border border-line rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-fg-muted">Context window</span>
            <span className="font-medium text-fg">
              {formatNumber(model.contextWindowTokens)}
            </span>
          </div>
          {model.maxOutputTokens && (
            <div className="flex justify-between items-center">
              <span className="text-fg-muted">Max output</span>
              <span className="font-medium text-fg">
                {formatNumber(model.maxOutputTokens)}
              </span>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-fg mb-4">Capabilities</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-fg-secondary">
            <span>{model.reasoning ? '✓' : '✗'}</span>
            <span>Reasoning & Planning</span>
          </div>
          <div className="flex items-center gap-2 text-fg-secondary">
            <span>{model.internetAccess ? '✓' : '✗'}</span>
            <span>Web Search</span>
          </div>
          <div className="flex items-center gap-2 text-fg-secondary">
            <span>{model.openSource ? '✓' : '✗'}</span>
            <span>Open Source</span>
          </div>
        </div>
      </section>

      {relevantBenchmarks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-fg mb-4">
            Best Scores
          </h2>
          <div className="space-y-2">
            {relevantBenchmarks
              .sort((a, b) => (model.scores[b.id] ?? 0) - (model.scores[a.id] ?? 0))
              .slice(0, 5)
              .map((bench) => (
                <div key={bench.id} className="flex justify-between items-center text-sm">
                  <span className="text-fg-muted">{bench.name}</span>
                  <span className="font-medium text-fg">
                    {model.scores[bench.id]}%
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
