interface Props {
  prosVsCompetitors: Record<string, string>
}

export function ProsCons({ prosVsCompetitors }: Props) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-fg mb-6">
        How It Compares
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(prosVsCompetitors).map(([competitor, advantage]) => (
          <div key={competitor} className="bg-surface-raised border border-line rounded-lg p-4">
            <h3 className="font-semibold text-fg mb-2">vs {competitor}</h3>
            <p className="text-fg-secondary text-sm">{advantage}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
