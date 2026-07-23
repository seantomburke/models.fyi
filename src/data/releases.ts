export type ReleaseType = 'new' | 'update' | 'price-change' | 'feature'

export interface Release {
  id: string
  modelId?: string
  type: ReleaseType
  title: string
  description: string
  date: string // ISO 8601
  link?: string
}

export const releases: Release[] = [
  {
    id: 'gemini-3-6-flash-family-launch',
    modelId: 'gemini-3-6-flash',
    type: 'new',
    title: 'Gemini 3.6 Flash and 3.5 Flash-Lite released',
    description:
      'Google ships a stronger agentic workhorse at $1.50/$7.50 per million tokens and a high-throughput Flash-Lite tier at $0.30/$2.50, both with 1M-token context windows.',
    date: '2026-07-21',
    link: 'https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/',
  },
  {
    id: 'benchmark-updates',
    type: 'update',
    title: 'New benchmarks added to comparison',
    description: 'Added Terminal-Bench and HLE benchmarks for more comprehensive model evaluation.',
    date: '2026-07-18',
  },
  {
    id: 'sonnet-5-intro-pricing',
    modelId: 'claude-sonnet-5',
    type: 'price-change',
    title: 'Claude Sonnet 5 intro pricing extended',
    description: 'Intro pricing extended through August 31, 2026: $2/$10 per million tokens (input/output).',
    date: '2026-07-18',
  },
  {
    id: 'kimi-k3-launch',
    modelId: 'kimi-k3',
    type: 'new',
    title: 'Kimi K3 released',
    description:
      'Moonshot AI launches its 2.8T-parameter flagship with 1M token context, native vision, and always-on reasoning. Open weights promised for late July.',
    date: '2026-07-16',
  },
  {
    id: 'inkling-launch',
    modelId: 'inkling',
    type: 'new',
    title: 'Inkling released by Thinking Machines',
    description:
      "Mira Murati's Thinking Machines Lab ships its first model: a 975B open-weights multimodal flagship under Apache 2.0, available on Hugging Face.",
    date: '2026-07-15',
    link: 'https://thinkingmachines.ai/news/introducing-inkling/',
  },
  {
    id: 'gpt-5-6-family-launch',
    modelId: 'gpt-5-6-sol',
    type: 'new',
    title: 'GPT-5.6 family released',
    description:
      'OpenAI ships three tiers at once: Sol (flagship, $5/$30 per million tokens), Terra (balanced, $2.50/$15), and Luna (budget, $1/$6), all with a 1.05M token context window.',
    date: '2026-07-09',
    link: 'https://openai.com/blog/gpt-5-6-sol',
  },
  {
    id: 'muse-spark-1-1-launch',
    modelId: 'muse-spark-1-1',
    type: 'new',
    title: 'Muse Spark 1.1 released',
    description:
      "Meta's first paid, closed-weights model after the open Llama era: 1M token context, an exceptional 256K max output, and aggressive $1.25/$4.25 pricing aimed at agent workloads.",
    date: '2026-07-09',
  },
  {
    id: 'grok-4-5-launch',
    modelId: 'grok-4-5',
    type: 'new',
    title: 'Grok 4.5 released',
    description:
      "xAI's new flagship pairs strong terminal and coding performance with real-time access to X (Twitter) data, at a mid-tier $2/$6 per million tokens with a 500K context window.",
    date: '2026-07-08',
  },
  {
    id: 'claude-fable-5-launch',
    modelId: 'claude-fable-5',
    type: 'new',
    title: 'Claude Fable 5 released',
    description: 'Anthropic launches its most capable reasoning model with 1M token context and state-of-the-art performance on SWE-Bench. Access was paused June 12 under a US export directive and restored July 1.',
    date: '2026-06-09',
    link: 'https://www.anthropic.com/news/claude-fable-5-mythos-5',
  },
  {
    id: 'sonnet-5-launch',
    modelId: 'claude-sonnet-5',
    type: 'new',
    title: 'Claude Sonnet 5 released',
    description: 'New Sonnet model with autonomous planning, multi-step tool use, and 1M token context. Available at intro pricing.',
    date: '2026-06-30',
    link: 'https://www.anthropic.com/news/claude-sonnet-5',
  },
  {
    id: 'opus-price-drop',
    modelId: 'claude-opus-4-8',
    type: 'price-change',
    title: 'Claude Opus 4.8 price reduced',
    description: 'Input price reduced from $15 to $5 per million tokens. Output price halved from $60 to $25.',
    date: '2026-06-05',
  },
  {
    id: 'gemini-3-5-flash-launch',
    modelId: 'gemini-3-5-flash',
    type: 'new',
    title: 'Gemini 3.5 Flash released',
    description:
      "Google's speed tier announced at I/O 2026 punches above its weight: it beats Gemini 3.1 Pro on some coding benchmarks at about 25% lower cost.",
    date: '2026-05-19',
  },
]
