/**
 * Core types for the Models.fyi static data layer.
 *
 * All model/benchmark facts are web-researched and hardcoded here.
 * See src/data/README.md for the refresh process.
 */

export type ProviderId =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'xai'
  | 'meta'
  | 'deepseek'
  | 'alibaba'
  | 'zhipu'
  | 'moonshot'
  | 'thinking-machines'

export interface Provider {
  id: ProviderId
  name: string
  /** Brand-ish color used for chart points and badges. */
  color: string
  openSource: boolean
}

export type BenchmarkId =
  | 'swe-bench-verified'
  | 'swe-bench-pro'
  | 'gpqa-diamond'
  | 'terminal-bench'
  | 'hle'

export type BenchmarkCategory =
  | 'Software Engineering'
  | 'Writing'
  | 'Reasoning'
  | 'Knowledge'
  | 'Coding'
  | 'Safety & Alignment'
  | 'Specialized Skills'
  | 'Adversarial Robustness'

export interface Benchmark {
  id: BenchmarkId
  name: string
  /**
   * Compact label for narrow table headers. Keep it to one line — the full
   * `name` still shows in the header tooltip and everywhere else.
   */
  shortName?: string
  /** What this benchmark measures, in plain language. */
  eli5: string
  /** All current benchmarks are 0-100 percentages, higher = better. */
  unit: '%'
  /** Category that groups related benchmarks. */
  category: BenchmarkCategory
  /** URL to the benchmark source or documentation. */
  sourceUrl?: string
  /** Organization that publishes or maintains this benchmark. */
  sourceOrganization?: string
}

/**
 * Where a displayed benchmark score comes from. Scores without an entry
 * in Model.scoreProvenance are provider-published (the dataset default).
 */
export interface ScoreProvenance {
  /** Who produced the number shown in Model.scores. */
  source: 'provider' | 'independent'
  /** Org that ran the eval, when source is 'independent' (e.g. 'vals.ai'). */
  runner?: string
  /**
   * An independent run of the same benchmark, when the displayed score is
   * provider-reported. Equal to the score = independently reproduced;
   * different = the runs diverge and readers should know.
   */
  independentScore?: number
  /** Org behind independentScore (e.g. 'tbench.ai (Codex)'). */
  independentRunner?: string
}

export type ModelTier = 'flagship' | 'balanced' | 'fast'

export interface Model {
  /** URL-safe slug, unique across the dataset. */
  id: string
  name: string
  providerId: ProviderId
  /** Exact API model string, when the provider publishes one. */
  apiId?: string
  tier: ModelTier
  openSource: boolean
  license?: string
  /** USD per 1M input tokens. null = no fixed price (e.g. self-hosted open source). */
  inputPricePerMTok: number | null
  /** USD per 1M output tokens. null = no fixed price. */
  outputPricePerMTok: number | null
  /** Context window in tokens. null = not reliably published. */
  contextWindowTokens: number | null
  maxOutputTokens?: number
  /** Whether this is a reasoning/thinking model. */
  reasoning: boolean
  /** Whether the provider's assistant offers built-in live web access. */
  internetAccess: boolean
  /** Whether this model can process images (vision/multimodal). */
  vision?: boolean
  /** Whether this model can generate images. */
  imageGeneration?: boolean
  /** ISO date, when reliably known. */
  releaseDate?: string
  /** Benchmark scores in percent. Missing key = no published score found. */
  scores: Partial<Record<BenchmarkId, number>>
  /**
   * Per-score sourcing for entries in `scores`. Only non-default cases need
   * an entry: independent runs, and provider numbers with a known
   * independent counterpart. Missing key = provider-published.
   */
  scoreProvenance?: Partial<Record<BenchmarkId, ScoreProvenance>>
  /** One-sentence plain-language description. */
  blurb: string
  /** Typical use cases for this model (e.g., "coding", "writing", "research"). */
  useCases?: string[]
  /** Why this model stands out: 1-2 paragraphs explaining strengths. */
  whyChooseThis?: string
  /** Strengths vs competitors: "vs GPT-5": "...", "vs Gemini": "..." */
  prosVsCompetitors?: Record<string, string>
  /** Related model IDs for "you might also like" recommendations. */
  relatedModelIds?: string[]
}
