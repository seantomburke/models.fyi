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
    id: 'claude-fable-5-launch',
    modelId: 'claude-fable-5',
    type: 'new',
    title: 'Claude Fable 5 released',
    description: 'Anthropic launches its most capable reasoning model with 1M token context and state-of-the-art performance on SWE-Bench.',
    date: '2026-07-15',
    link: 'https://www.anthropic.com/news/claude-fable-5',
  },
  {
    id: 'gpt-5-6-sol-launch',
    modelId: 'gpt-5-6-sol',
    type: 'new',
    title: 'GPT-5.6 Sol released',
    description: 'OpenAI releases Sol variant optimized for speed and reasoning tasks, with 1.05M token context.',
    date: '2026-07-09',
    link: 'https://openai.com/blog/gpt-5-6-sol',
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
    id: 'sonnet-5-intro-pricing',
    modelId: 'claude-sonnet-5',
    type: 'price-change',
    title: 'Claude Sonnet 5 intro pricing extended',
    description: 'Intro pricing extended through August 31, 2026: $2/$10 per million tokens (input/output).',
    date: '2026-07-18',
  },
  {
    id: 'gemini-3-1-pro-update',
    modelId: 'gemini-3-1-pro',
    type: 'update',
    title: 'Gemini 3.1 Pro updated',
    description: 'Bug fixes and performance improvements. Now faster on long-context tasks.',
    date: '2026-07-12',
  },
  {
    id: 'web-search-claude',
    modelId: 'claude-opus-4-8',
    type: 'feature',
    title: 'Web search available for all Claude models',
    description: 'All Claude models (Opus, Sonnet, Haiku) now support real-time web search via the API and Claude.ai.',
    date: '2026-05-20',
  },
  {
    id: 'gpt-4o-vision-update',
    modelId: 'gpt-4o',
    type: 'feature',
    title: 'GPT-4o vision model improvements',
    description: 'Enhanced vision understanding for charts, diagrams, and complex visual content.',
    date: '2026-06-10',
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
    id: 'llama-3-2-released',
    modelId: 'llama-3-2-70b',
    type: 'new',
    title: 'Meta Llama 3.2 released',
    description: 'New open-source model family with 70B and 405B sizes. Strong performance on reasoning benchmarks.',
    date: '2026-07-08',
  },
  {
    id: 'gpt-5-6-luna-launch',
    modelId: 'gpt-5-6-luna',
    type: 'new',
    title: 'GPT-5.6 Luna released',
    description: 'Affordable variant focused on cost-efficiency with strong performance for everyday tasks.',
    date: '2026-07-01',
  },
  {
    id: 'function-calling-haiku',
    modelId: 'claude-haiku-4-5',
    type: 'feature',
    title: 'Function calling for Claude Haiku',
    description: 'Haiku now supports tool use and function calling for agent-based applications.',
    date: '2026-06-15',
  },
  {
    id: 'benchmark-updates',
    type: 'update',
    title: 'New benchmarks added to comparison',
    description: 'Added Terminal-Bench and HLE benchmarks for more comprehensive model evaluation.',
    date: '2026-07-18',
  },
]
