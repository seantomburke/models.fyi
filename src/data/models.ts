import type { Model } from './types.ts'

/**
 * Model facts researched 2026-07-14. Scores are provider-published evals
 * where available, otherwise independent leaderboard runs (noted below).
 * A missing score means no reliable published number was found, not zero.
 * Sources are listed in src/data/README.md.
 */
export const models: Model[] = [
  // ─── Anthropic ───────────────────────────────────────────────
  {
    id: 'claude-fable-5',
    name: 'Claude Fable 5',
    providerId: 'anthropic',
    apiId: 'claude-fable-5',
    tier: 'flagship',
    openSource: false,
    inputPricePerMTok: 10,
    outputPricePerMTok: 50,
    contextWindowTokens: 1_000_000,
    maxOutputTokens: 128_000,
    reasoning: true,
    internetAccess: true,
    scores: {
      'swe-bench-verified': 95.0, // vals.ai independent run; Anthropic claims 95.5
      'swe-bench-pro': 80.3, // Anthropic-published; BenchLM attributes 80.3 to Mythos 5
      'gpqa-diamond': 93.2, // vals.ai independent run (Anthropic published no number)
      'terminal-bench': 88.0, // Anthropic harness; independent runs land 80-84 (tbench.ai #1 at 83.8)
    },
    blurb:
      "Anthropic's most capable model. Built for the hardest reasoning and long autonomous work, at a premium price.",
  },
  {
    id: 'claude-opus-4-8',
    name: 'Claude Opus 4.8',
    providerId: 'anthropic',
    apiId: 'claude-opus-4-8',
    tier: 'flagship',
    openSource: false,
    inputPricePerMTok: 5,
    outputPricePerMTok: 25,
    contextWindowTokens: 1_000_000,
    maxOutputTokens: 128_000,
    reasoning: true,
    internetAccess: true,
    scores: {
      'swe-bench-verified': 88.6,
      'swe-bench-pro': 69.2,
      'gpqa-diamond': 93.6,
      'terminal-bench': 74.6,
    },
    blurb:
      'A coding workhorse. Near the top of the toughest coding benchmarks at half the price of Fable 5.',
  },
  {
    id: 'claude-sonnet-5',
    name: 'Claude Sonnet 5',
    providerId: 'anthropic',
    apiId: 'claude-sonnet-5',
    tier: 'balanced',
    openSource: false,
    inputPricePerMTok: 3,
    outputPricePerMTok: 15,
    contextWindowTokens: 1_000_000,
    maxOutputTokens: 128_000,
    reasoning: true,
    internetAccess: true,
    scores: {
      'swe-bench-verified': 82.1,
      'swe-bench-pro': 63.2,
      'gpqa-diamond': 91.1, // Artificial Analysis independent run (Anthropic published none)
      'terminal-bench': 80.4,
    },
    blurb:
      'Close to Opus quality on coding and everyday tasks at a much lower price. The sensible default for most people.',
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    providerId: 'anthropic',
    apiId: 'claude-haiku-4-5',
    tier: 'fast',
    openSource: false,
    inputPricePerMTok: 1,
    outputPricePerMTok: 5,
    contextWindowTokens: 200_000,
    maxOutputTokens: 64_000,
    reasoning: true,
    internetAccess: true,
    scores: {
      'swe-bench-verified': 73.3,
    },
    blurb:
      "Anthropic's fastest and cheapest model. Great for quick answers and simple tasks in high volume.",
  },

  // ─── OpenAI ──────────────────────────────────────────────────
  {
    id: 'gpt-5-6-sol',
    name: 'GPT-5.6 Sol',
    providerId: 'openai',
    tier: 'flagship',
    openSource: false,
    inputPricePerMTok: 5,
    outputPricePerMTok: 30,
    contextWindowTokens: 1_050_000,
    maxOutputTokens: 128_000,
    reasoning: true,
    internetAccess: true,
    releaseDate: '2026-07-09',
    scores: {
      'terminal-bench': 88.8, // OpenAI-published; no tbench.ai run yet
      'swe-bench-pro': 64.6,
      'gpqa-diamond': 94.1, // Artificial Analysis independent run (OpenAI's 94.6 remains unconfirmed)
    },
    blurb:
      "OpenAI's brand-new flagship. State of the art on autonomous terminal work, strong all-rounder.",
  },
  {
    id: 'gpt-5-6-terra',
    name: 'GPT-5.6 Terra',
    providerId: 'openai',
    tier: 'balanced',
    openSource: false,
    inputPricePerMTok: 2.5,
    outputPricePerMTok: 15,
    contextWindowTokens: 1_050_000,
    maxOutputTokens: 128_000,
    reasoning: true,
    internetAccess: true,
    releaseDate: '2026-07-09',
    scores: {
      'swe-bench-pro': 63.4,
      'terminal-bench': 87.4, // OpenAI-published; tbench.ai independent run (Codex) lands 78.4
    },
    blurb:
      'The balanced middle tier of the GPT-5.6 family. Most of Sol\'s ability at half the cost.',
  },
  {
    id: 'gpt-5-6-luna',
    name: 'GPT-5.6 Luna',
    providerId: 'openai',
    tier: 'fast',
    openSource: false,
    inputPricePerMTok: 1,
    outputPricePerMTok: 6,
    contextWindowTokens: 1_050_000,
    maxOutputTokens: 128_000,
    reasoning: true,
    internetAccess: true,
    releaseDate: '2026-07-09',
    scores: {
      'swe-bench-pro': 62.7,
      'terminal-bench': 84.7, // OpenAI-published; tbench.ai independent run (Codex) lands 75.7
    },
    blurb:
      'The fastest, most cost-efficient GPT-5.6 tier. Built for speed and high-volume simple tasks.',
  },

  // ─── Google ──────────────────────────────────────────────────
  {
    id: 'gemini-3-1-pro',
    name: 'Gemini 3.1 Pro',
    providerId: 'google',
    tier: 'flagship',
    openSource: false,
    inputPricePerMTok: 2,
    outputPricePerMTok: 12,
    contextWindowTokens: 1_000_000,
    reasoning: true,
    internetAccess: true,
    scores: {
      'swe-bench-verified': 80.6,
      'swe-bench-pro': 54.2, // from Anthropic's comparison table; Google published none
      'gpqa-diamond': 94.3,
      'terminal-bench': 70.7, // tbench.ai leaderboard (Google published only 2.0)
    },
    blurb:
      "Google's flagship. A top-tier reasoner with strong long-context skills at an aggressive price.",
  },
  {
    id: 'gemini-3-5-flash',
    name: 'Gemini 3.5 Flash',
    providerId: 'google',
    tier: 'fast',
    openSource: false,
    inputPricePerMTok: 1.5,
    outputPricePerMTok: 9,
    contextWindowTokens: 1_000_000,
    maxOutputTokens: 64_000,
    reasoning: true,
    internetAccess: true,
    releaseDate: '2026-05-19',
    scores: {
      'swe-bench-pro': 55.1,
      'terminal-bench': 76.2,
    },
    blurb:
      'Google\'s speed tier that punches above its weight. Beats 3.1 Pro on coding at about 25% lower cost.',
  },

  // ─── xAI ─────────────────────────────────────────────────────
  {
    id: 'grok-4-5',
    name: 'Grok 4.5',
    providerId: 'xai',
    apiId: 'grok-4.5',
    tier: 'flagship',
    openSource: false,
    inputPricePerMTok: 2, // list price up to 200K context; longer requests bill higher
    outputPricePerMTok: 6,
    contextWindowTokens: 500_000,
    reasoning: true,
    internetAccess: true,
    releaseDate: '2026-07-08',
    scores: {
      'swe-bench-pro': 64.7, // xAI-published; no independent run yet
      'gpqa-diamond': 93.1, // Artificial Analysis independent run (xAI published none)
      'terminal-bench': 83.3, // xAI-published; tbench.ai independent run (Cursor CLI) lands 79.3
    },
    blurb:
      "xAI's brand-new flagship. Strong terminal and coding chops at a mid-tier price, with live access to X (Twitter) data.",
  },
  {
    id: 'grok-4-1-fast',
    name: 'Grok 4.1 Fast',
    providerId: 'xai',
    tier: 'fast',
    openSource: false,
    inputPricePerMTok: 0.2,
    outputPricePerMTok: 0.5,
    contextWindowTokens: 2_000_000,
    reasoning: true,
    internetAccess: true,
    scores: {
      'gpqa-diamond': 85.3, // Artificial Analysis independent run (reasoning mode)
    },
    blurb:
      'A budget speedster with a huge 2M-token context window. One of the cheapest ways to process large amounts of text.',
  },

  // ─── Meta ────────────────────────────────────────────────────
  {
    id: 'muse-spark-1-1',
    name: 'Muse Spark 1.1',
    providerId: 'meta',
    apiId: 'muse-spark-1.1',
    tier: 'flagship',
    openSource: false,
    inputPricePerMTok: 1.25,
    outputPricePerMTok: 4.25,
    contextWindowTokens: 1_000_000,
    maxOutputTokens: 256_000,
    reasoning: true,
    internetAccess: true,
    releaseDate: '2026-07-09',
    scores: {
      'swe-bench-pro': 61.5, // Meta-published; no independent run yet
      'gpqa-diamond': 88.4, // Artificial Analysis independent run (Meta published none)
      'terminal-bench': 76.2, // tbench.ai independent run (mini-SWE-agent); Meta itself published only a 2.0 number
    },
    blurb:
      "Meta's new flagship and its first paid, closed-weights model after the open Llama era. Built for agent work at an aggressive price.",
  },

  // ─── Open source ─────────────────────────────────────────────
  {
    id: 'glm-5-2',
    name: 'GLM-5.2',
    providerId: 'zhipu',
    tier: 'flagship',
    openSource: true,
    license: 'MIT',
    inputPricePerMTok: null,
    outputPricePerMTok: null,
    contextWindowTokens: 1_000_000,
    reasoning: true,
    internetAccess: false,
    scores: {
      'swe-bench-pro': 62.1,
      'gpqa-diamond': 91.2,
      'terminal-bench': 81.0,
    },
    blurb:
      'The current #1 open-source model. Frontier-level science reasoning you can download and run yourself, MIT-licensed.',
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    providerId: 'deepseek',
    tier: 'flagship',
    openSource: true,
    license: 'MIT',
    inputPricePerMTok: null,
    outputPricePerMTok: null,
    contextWindowTokens: null,
    reasoning: true,
    internetAccess: false,
    scores: {
      // DeepSeek technical report figures for V4 Pro in "Think Max" mode.
      'swe-bench-verified': 80.6,
      'swe-bench-pro': 55.4,
      'gpqa-diamond': 90.1, // independently reproduced by NIST/CAISI
    },
    blurb:
      'An open-source powerhouse for code and math. Free to self-host under an MIT license.',
  },
  {
    id: 'qwen-3-6',
    name: 'Qwen 3.6',
    providerId: 'alibaba',
    tier: 'flagship',
    openSource: true,
    license: 'Apache 2.0',
    inputPricePerMTok: null,
    outputPricePerMTok: null,
    contextWindowTokens: null,
    reasoning: true,
    internetAccess: false,
    scores: {
      // Alibaba-published figures for Qwen3.6-35B-A3B, the flagship open release.
      'swe-bench-verified': 73.4,
      'swe-bench-pro': 49.5,
      'gpqa-diamond': 86.0,
    },
    blurb:
      'The leading open model for multilingual work, under the business-friendly Apache 2.0 license.',
  },
  {
    id: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    providerId: 'meta',
    tier: 'flagship',
    openSource: true,
    license: 'Llama 4 Community License',
    inputPricePerMTok: null,
    outputPricePerMTok: null,
    contextWindowTokens: 1_000_000,
    reasoning: false,
    internetAccess: false,
    scores: {
      'gpqa-diamond': 69.8,
    },
    blurb:
      "Meta's general-purpose open model. Easy to run and widely supported, though newer open models beat it on hard reasoning.",
  },
  {
    id: 'llama-4-scout',
    name: 'Llama 4 Scout',
    providerId: 'meta',
    tier: 'balanced',
    openSource: true,
    license: 'Llama 4 Community License',
    inputPricePerMTok: null,
    outputPricePerMTok: null,
    contextWindowTokens: 10_000_000,
    reasoning: false,
    internetAccess: false,
    scores: {
      'gpqa-diamond': 57.2,
    },
    blurb:
      'The long-context champion. A 10-million-token window, enough to read hundreds of books at once.',
  },
]
