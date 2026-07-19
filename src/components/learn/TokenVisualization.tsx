
const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E2', '#F8B88B', '#79C6D9', '#FDA7DF', '#A3D5A3', '#FFEAA7', '#DFE6E9',
]

function getColorForToken(index: number): string {
  return COLORS[index % COLORS.length]
}

export function TokenVisualization() {
  const examples = [
    {
      text: 'The quick brown fox',
      description: 'Short sentence: 4 words = 4 tokens',
    },
    {
      text: 'Understanding tokenization',
      description: 'Compound words may be split: 2 words = 3 tokens',
    },
    {
      text: 'Artificial intelligence models process text by breaking it into smaller chunks called tokens.',
      description: 'Longer sentence shows how tokens vary in size',
    },
  ]

  return (
    <div className="space-y-8">
      {examples.map((example, exIndex) => {
        const tokens = example.text.split(/\s+/)

        return (
          <div key={exIndex} className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-fg mb-2">{example.description}</h3>
              <div className="flex flex-wrap gap-2">
                {tokens.map((token, tokenIndex) => (
                  <div
                    key={tokenIndex}
                    className="inline-flex flex-col items-center"
                  >
                    <div
                      className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-transform duration-150 hover:scale-105 cursor-help"
                      style={{ backgroundColor: getColorForToken(tokenIndex) }}
                      title={`Token ${tokenIndex + 1}: "${token}"`}
                    >
                      {token}
                    </div>
                    <span className="mt-1 text-xs text-fg-muted">#{tokenIndex + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-fg-secondary">
              Total tokens: <span className="font-semibold text-fg">{tokens.length}</span>
            </p>
          </div>
        )
      })}

      <div className="rounded-lg border border-line bg-surface p-4">
        <h3 className="text-sm font-semibold text-fg mb-2">Why tokens matter</h3>
        <ul className="space-y-2 text-sm text-fg-secondary">
          <li className="flex gap-2">
            <span className="text-accent-deep">•</span>
            <span>Models charge per token, not per word</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-deep">•</span>
            <span>A token is roughly 3/4 of a word on average</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-deep">•</span>
            <span>Complex words break into multiple tokens</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-deep">•</span>
            <span>Every token in your prompt counts toward the cost</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
