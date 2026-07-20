import type { Model, Benchmark } from '../../data/types'
import { provenanceFor } from '../../lib/scoreProvenance'

interface Props {
  model: Model
  benchmarks: Benchmark[]
}

export function ModelBenchmarks({ model, benchmarks }: Props) {
  const groupedByCategory = benchmarks.reduce(
    (acc, bench) => {
      const cat = bench.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(bench)
      return acc
    },
    {} as Record<string, Benchmark[]>,
  )

  return (
    <section>
      <h2 className="text-2xl font-bold text-fg mb-6">
        Benchmark Scores
      </h2>

      <div className="space-y-8">
        {Object.entries(groupedByCategory).map(([category, benches]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-fg mb-4">
              {category}
            </h3>
            <div className="space-y-3">
              {benches.map((bench) => {
                const score = model.scores[bench.id]
                if (score === undefined) return null
                const provenance = provenanceFor(model, bench.id)
                return (
                  <div key={bench.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-medium text-fg">{bench.name}</p>
                        <p className="text-sm text-fg-muted">{bench.eli5}</p>
                      </div>
                      <span className="text-lg font-bold text-fg">
                        {score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-line-strong rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-fg-muted">
                      {provenance.detail}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
