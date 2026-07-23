import type { Model } from './types.ts'

/**
 * Model facts researched 2026-07-22. Scores are provider-published evals
 * where available, otherwise independent leaderboard runs (noted below).
 * A missing score means no reliable published number was found, not zero.
 * Sources are listed in src/data/README.md.
 *
 * scoreProvenance records who produced each displayed number; scores
 * without an entry are provider-published. When an independent run of a
 * provider-reported benchmark exists, it's recorded as independentScore
 * so the UI can surface the divergence (or the confirmation).
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
    vision: true, // Anthropic model overview: all current Claude models support text and image input
    imageGeneration: false, // same doc: text output only
    scores: {
      'swe-bench-verified': 95.0, // Anthropic-published (averaged over 5 trials)
      'swe-bench-pro': 80.0, // Anthropic-published via BenchLM (July 2026)
      'gpqa-diamond': 92.6, // Anthropic-published (July 2026)
      'terminal-bench': 88.0, // vals.ai independent run (July 16, 2026)
      'hle': 53.3, // Artificial Analysis independent run (July 2026)
      'aa-intelligence-index': 60.0, // Artificial Analysis v4.1, max effort with fallback
    },
    scoreProvenance: {
      'terminal-bench': { source: 'independent', runner: 'vals.ai' },
      'hle': { source: 'independent', runner: 'Artificial Analysis' },
      'aa-intelligence-index': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://artificialanalysis.ai/models/claude-fable-5/',
      },
    },
    blurb:
      "Anthropic's most capable model. Built for the hardest reasoning and long autonomous work, at a premium price.",
    useCases: ['coding', 'research', 'debugging'],
    whyChooseThis:
      'Fable 5 is the strongest pure reasoning model on the market. If your task requires solving novel problems, multi-step planning, or deep scientific reasoning, Fable 5 consistently delivers. The 1M token context lets you work with entire codebases or research papers in a single request.',
    prosVsCompetitors: {
      'GPT-5.6 Sol': 'Fable 5 excels at complex multi-step reasoning and debugging. Sol is faster for immediate responses.',
      'Gemini 3.1 Pro': 'Fable 5 edges out on reasoning-heavy tasks; Gemini wins on long-context retrieval and speed.',
    },
    relatedModelIds: ['claude-opus-4-8', 'gpt-5-6-sol'],
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
    vision: true, // Anthropic model overview: all current Claude models support text and image input
    imageGeneration: false, // same doc: text output only
    scores: {
      'swe-bench-verified': 88.6,
      'swe-bench-pro': 69.2,
      'gpqa-diamond': 93.6,
      'terminal-bench': 74.6, // Anthropic-published (Terminus 2); tbench.ai independent run (Claude Code) lands higher at 78.9
      'hle': 45.7, // Artificial Analysis independent run (July 2026)
    },
    scoreProvenance: {
      'terminal-bench': {
        source: 'provider',
        independentScore: 78.9,
        independentRunner: 'tbench.ai (Claude Code)',
      },
      'hle': { source: 'independent', runner: 'Artificial Analysis' },
    },
    blurb:
      'A coding workhorse. Near the top of the toughest coding benchmarks at half the price of Fable 5.',
    useCases: ['coding', 'debugging', 'analysis'],
    whyChooseThis:
      'Opus 4.8 is the sweet spot for professional developers. It scores near the top on coding benchmarks at half the cost of Fable 5, and it maintains the full 1M token context for working with large projects. The best balance of power and price.',
    prosVsCompetitors: {
      'Claude Sonnet 5': 'Opus is stronger on complex code; Sonnet is faster and cheaper for simpler tasks.',
      'GPT-5.6 Sol': 'Opus leads on SWE-Bench coding; Sol has a slight edge on reasoning-heavy problems.',
    },
    relatedModelIds: ['claude-fable-5', 'claude-sonnet-5'],
  },
  {
    id: 'claude-sonnet-5',
    name: 'Claude Sonnet 5',
    providerId: 'anthropic',
    apiId: 'claude-sonnet-5',
    tier: 'balanced',
    openSource: false,
    inputPricePerMTok: 2, // intro pricing $2/$10 through Aug 31, 2026; regular $3/$15
    outputPricePerMTok: 10,
    contextWindowTokens: 1_000_000,
    maxOutputTokens: 128_000,
    reasoning: true,
    internetAccess: true,
    vision: true, // Anthropic model overview: all current Claude models support text and image input
    imageGeneration: false, // same doc: text output only
    releaseDate: '2026-06-30',
    scores: {
      'swe-bench-verified': 82.1,
      'swe-bench-pro': 63.2,
      'gpqa-diamond': 91.1, // Artificial Analysis independent run (Anthropic published none)
      'terminal-bench': 80.4, // Anthropic-published; tbench.ai independent run (Claude Code) lands 74.6
      'hle': 57.4, // BenchLM independent run (July 2026)
      'aa-intelligence-index': 53.0, // Artificial Analysis v4.1, adaptive reasoning / max effort
    },
    scoreProvenance: {
      'gpqa-diamond': { source: 'independent', runner: 'Artificial Analysis' },
      'terminal-bench': {
        source: 'provider',
        independentScore: 74.6,
        independentRunner: 'tbench.ai (Claude Code)',
      },
      'hle': { source: 'independent', runner: 'BenchLM' },
      'aa-intelligence-index': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://artificialanalysis.ai/models/claude-sonnet-5/',
      },
    },
    blurb:
      'The most agentic Sonnet yet, released June 30. Can make plans and run tools autonomously. Best value for daily work, now at intro pricing.',
    useCases: ['writing', 'analysis', 'coding'],
    whyChooseThis:
      'Sonnet 5 is the best all-rounder for teams on a budget. It can plan and execute multi-step workflows autonomously, reason through complex problems, and maintain 1M-token context. At intro pricing ($2/$10), it\'s unbeatable value.',
    prosVsCompetitors: {
      'Claude Haiku 4.5': 'Sonnet is significantly more capable; Haiku is 5x cheaper and better for simple tasks.',
      'GPT-5.6 Terra': 'Sonnet now costs less at intro pricing; Terra is strong but Sonnet edges it on autonomy.',
    },
    relatedModelIds: ['claude-opus-4-8', 'claude-haiku-4-5'],
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
    vision: true, // Anthropic model overview: all current Claude models support text and image input
    imageGeneration: false, // same doc: text output only
    scores: {
      'swe-bench-verified': 73.3,
    },
    blurb:
      "Anthropic's fastest and cheapest model. Great for quick answers and simple tasks in high volume.",
    useCases: ['summarization', 'translation', 'brainstorming'],
    whyChooseThis:
      'Haiku is perfect for high-volume, cost-conscious applications. At $1/$5, it\'s one of the cheapest frontier models available. Despite its speed, it still supports reasoning and web search, making it surprisingly versatile.',
    prosVsCompetitors: {
      'Claude Sonnet 5': 'Haiku is 5x cheaper but less capable; Sonnet is the all-rounder.',
      'GPT-5.6 Luna': 'Both are budget options; Haiku is cheaper, Luna has more context.',
    },
    relatedModelIds: ['claude-sonnet-5', 'gpt-5-6-luna'],
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
    vision: true, // OpenAI models docs: all latest models support text and image input
    imageGeneration: false, // OpenAI models docs: text output only; GPT Image 2 is the separate image model
    releaseDate: '2026-07-09',
    scores: {
      'swe-bench-verified': 96.2, // Vals independent run (mini-swe-agent, July 2026)
      'terminal-bench': 88.8, // OpenAI-published (single-agent) (July 2026)
      'swe-bench-pro': 64.6, // OpenAI-published
      'gpqa-diamond': 94.6, // OpenAI-published (July 2026)
      'hle': 47.2, // Artificial Analysis independent run (July 2026; max effort)
      'aa-intelligence-index': 59.0, // Artificial Analysis v4.1, max effort
    },
    scoreProvenance: {
      'swe-bench-verified': { source: 'independent', runner: 'Vals AI (mini-swe-agent)' },
      'terminal-bench': {
        source: 'provider',
        independentScore: 85.77,
        independentRunner: 'Vals AI (Terminus 2)',
      },
      'hle': { source: 'independent', runner: 'Artificial Analysis' },
      'aa-intelligence-index': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://artificialanalysis.ai/models/gpt-5-6-sol/',
      },
    },
    blurb:
      "OpenAI's brand-new flagship. State of the art on autonomous terminal work, strong all-rounder.",
    useCases: ['coding', 'research', 'debugging'],
    whyChooseThis:
      'Sol leads the market on autonomous terminal and DevOps tasks, executing shell commands and complex workflows better than any competitor. If you\'re automating infrastructure or running long-running agents, Sol is the benchmark.',
    prosVsCompetitors: {
      'Claude Fable 5': 'Sol is faster and stronger on terminal tasks; Fable edges it on pure reasoning.',
      'Gemini 3.1 Pro': 'Sol excels at agentic work; Gemini is more aggressive on pricing.',
    },
    relatedModelIds: ['gpt-5-6-terra', 'claude-fable-5'],
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
    vision: true, // OpenAI models docs: all latest models support text and image input
    imageGeneration: false, // OpenAI models docs: text output only; GPT Image 2 is the separate image model
    releaseDate: '2026-07-09',
    scores: {
      'swe-bench-pro': 63.4, // OpenAI-published
      'gpqa-diamond': 92.9, // OpenAI-published
      'terminal-bench': 87.4, // OpenAI-published; tbench.ai independent run (Codex) lands 78.4
      'hle': 41.8, // Artificial Analysis independent run (max effort, closed-book)
      'aa-intelligence-index': 55.0, // Artificial Analysis v4.1, max effort
    },
    scoreProvenance: {
      'terminal-bench': {
        source: 'provider',
        independentScore: 78.4,
        independentRunner: 'tbench.ai (Codex)',
      },
      'hle': { source: 'independent', runner: 'Artificial Analysis' },
      'aa-intelligence-index': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://artificialanalysis.ai/models/gpt-5-6-terra/',
      },
    },
    blurb:
      'The balanced middle tier of the GPT-5.6 family. Most of Sol\'s ability at half the cost.',
    useCases: ['coding', 'analysis', 'writing'],
    whyChooseThis:
      'Terra is the Goldilocks option in the GPT-5.6 lineup. It delivers most of Sol\'s capability at half the cost, with a balanced feature set. Great for teams who want OpenAI\'s capabilities without premium pricing.',
    prosVsCompetitors: {
      'GPT-5.6 Sol': 'Terra is half the cost; Sol is faster and better at agentic work.',
      'Claude Sonnet 5': 'At intro pricing, Sonnet is cheaper; Terra has broader capabilities.',
    },
    relatedModelIds: ['gpt-5-6-sol', 'gpt-5-6-luna'],
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
    vision: true, // OpenAI models docs: all latest models support text and image input
    imageGeneration: false, // OpenAI models docs: text output only; GPT Image 2 is the separate image model
    releaseDate: '2026-07-09',
    scores: {
      'swe-bench-verified': 93.0, // Vals independent run (mini-swe-agent, July 2026)
      'swe-bench-pro': 62.7, // OpenAI-published
      'gpqa-diamond': 92.3, // OpenAI-published
      'terminal-bench': 84.7, // OpenAI-published; tbench.ai independent run (Codex) lands 75.7
      'hle': 37.2, // Artificial Analysis independent run (medium effort, closed-book)
      'aa-intelligence-index': 46.0, // Artificial Analysis v4.1, high effort
    },
    scoreProvenance: {
      'swe-bench-verified': { source: 'independent', runner: 'Vals AI (mini-swe-agent)' },
      'terminal-bench': {
        source: 'provider',
        independentScore: 79.03,
        independentRunner: 'Vals AI (Terminus 2)',
      },
      'hle': { source: 'independent', runner: 'Artificial Analysis' },
      'aa-intelligence-index': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://artificialanalysis.ai/models/gpt-5-6-luna-high/',
      },
    },
    blurb:
      'The fastest, most cost-efficient GPT-5.6 tier. Built for speed and high-volume simple tasks.',
    useCases: ['summarization', 'translation', 'brainstorming'],
    whyChooseThis:
      'Luna is OpenAI\'s speed and efficiency tier. At $1/$6, it competes on price with Haiku while maintaining access to OpenAI\'s full feature set and 1M+ token context. Perfect for high-volume, cost-sensitive applications.',
    prosVsCompetitors: {
      'Claude Haiku 4.5': 'Luna is slightly more expensive but has more context; Haiku is simpler.',
      'GPT-5.6 Terra': 'Luna is 2.5x cheaper; Terra is more capable.',
    },
    relatedModelIds: ['gpt-5-6-terra', 'claude-haiku-4-5'],
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
    vision: true, // Gemini API model card: inputs are text, image, video, audio, PDF
    imageGeneration: false, // same card: output is text; image generation listed as not supported
    scores: {
      'swe-bench-verified': 80.6, // Google-published
      'swe-bench-pro': 54.2, // from Anthropic's comparison table; Google published none
      'gpqa-diamond': 94.3, // Artificial Analysis independent run (July 2026)
      'terminal-bench': 73.8, // Google-published (Terminus-2 harness, July 2026)
      // Google-published model card, "No tools" column (2026-07-20). The same
      // row publishes 51.4 under "Search (blocklist) + Code"; the column is
      // closed-book across the dataset, so the 44.4 run is the comparable one.
      'hle': 44.4,
    },
    scoreProvenance: {
      'swe-bench-pro': { source: 'independent', runner: "Anthropic's comparison table" },
      'gpqa-diamond': { source: 'independent', runner: 'Artificial Analysis' },
    },
    blurb:
      "Google's flagship. A top-tier reasoner with strong long-context skills at an aggressive price.",
    useCases: ['research', 'analysis', 'coding'],
    whyChooseThis:
      'Gemini 3.1 Pro is Google\'s aggressive flagship. It competes on GPQA reasoning with the best models while underpricing competitors. The 1M context and web search make it excellent for research tasks.',
    prosVsCompetitors: {
      'Claude Fable 5': 'Gemini is cheaper and faster; Fable has a slight reasoning edge.',
      'GPT-5.6 Sol': 'Gemini is more aggressive on pricing; Sol leads on terminal/agentic work.',
    },
    relatedModelIds: ['gemini-3-6-flash', 'claude-fable-5'],
  },
  {
    id: 'gemini-3-6-flash',
    name: 'Gemini 3.6 Flash',
    providerId: 'google',
    apiId: 'gemini-3.6-flash',
    tier: 'balanced',
    openSource: false,
    inputPricePerMTok: 1.5,
    outputPricePerMTok: 7.5,
    contextWindowTokens: 1_048_576,
    maxOutputTokens: 65_536,
    reasoning: true,
    internetAccess: true,
    vision: true,
    releaseDate: '2026-07-21',
    scores: {
      'swe-bench-pro': 58.7, // Google-published (public subset)
      'terminal-bench': 78.0, // Google-published (Terminus-2 harness)
      'aa-intelligence-index': 50.0, // Artificial Analysis v4.1, high effort
    },
    scoreProvenance: {
      'aa-intelligence-index': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://artificialanalysis.ai/models/gemini-3-6-flash/',
      },
    },
    blurb:
      "Google's newest workhorse model. Stronger at agentic coding than 3.5 Flash while using fewer tokens and charging less for output.",
    useCases: ['coding', 'analysis', 'research'],
    whyChooseThis:
      'Gemini 3.6 Flash improves coding, computer use, and long-running agent workflows while cutting output cost and token usage versus 3.5 Flash. Its 1M-token context and built-in Google tools make it a strong value pick for iterative work.',
    prosVsCompetitors: {
      'Gemini 3.5 Flash': '3.6 Flash scores higher on coding and terminal work, uses fewer tokens, and costs less for output.',
      'Claude Sonnet 5': '3.6 Flash is cheaper and tightly integrated with Google tools; Sonnet remains stronger on several coding evaluations.',
    },
    relatedModelIds: ['gemini-3-5-flash', 'gemini-3-1-pro'],
  },
  {
    id: 'gemini-3-5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    providerId: 'google',
    apiId: 'gemini-3.5-flash-lite',
    tier: 'fast',
    openSource: false,
    inputPricePerMTok: 0.3,
    outputPricePerMTok: 2.5,
    contextWindowTokens: 1_048_576,
    maxOutputTokens: 65_536,
    reasoning: true,
    internetAccess: true,
    vision: true,
    releaseDate: '2026-07-21',
    scores: {
      'swe-bench-pro': 54.2, // Google-published (public subset)
      'terminal-bench': 54.0, // Google-published (Terminus-2 harness)
    },
    blurb:
      "Google's fastest, lowest-cost 3.5 model. Built for high-volume extraction, analysis, and autonomous subagent work.",
    useCases: ['summarization', 'analysis', 'translation'],
    whyChooseThis:
      'Flash-Lite is designed for workloads where throughput and cost matter most. It keeps a 1M-token context window, reasoning, multimodal input, and built-in tools at a fraction of flagship pricing.',
    prosVsCompetitors: {
      'Gemini 3.6 Flash': 'Flash-Lite is five times cheaper on input and three times cheaper on output; 3.6 Flash is stronger for demanding agentic work.',
      'Claude Haiku 4.5': 'Flash-Lite is cheaper with a much larger context window; Haiku posts a stronger published SWE-bench Verified score.',
    },
    relatedModelIds: ['gemini-3-6-flash', 'gemini-3-5-flash'],
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
    vision: true, // Gemini API model card: inputs are text, image, video, audio, PDF
    imageGeneration: false, // same card: output is text only
    releaseDate: '2026-05-19',
    scores: {
      'swe-bench-verified': 78.0, // Google-published (announced at Google I/O 2026)
      'swe-bench-pro': 55.1, // Google-published (single attempt)
      'gpqa-diamond': 92.2, // Artificial Analysis independent run (the model card publishes no GPQA)
      'terminal-bench': 76.2, // Google-published (Terminus-2 harness); Vals independent run lands 74.16
      'hle': 40.2, // Google-published (model card, full set text + multimodal)
    },
    scoreProvenance: {
      'gpqa-diamond': { source: 'independent', runner: 'Artificial Analysis' },
      'terminal-bench': {
        source: 'provider',
        independentScore: 74.16,
        independentRunner: 'Vals AI (Terminus 2)',
      },
    },
    blurb:
      'Google\'s speed tier that punches above its weight. Beats 3.1 Pro on coding at about 25% lower cost.',
    useCases: ['coding', 'analysis', 'writing'],
    whyChooseThis:
      'Flash is the rare speed-tier model that doesn\'t sacrifice much. It beats even Gemini 3.1 Pro on some coding benchmarks while being 25% cheaper. Best for teams who want Google\'s capabilities at a mid-tier price.',
    prosVsCompetitors: {
      'Gemini 3.1 Pro': 'Flash is cheaper and often outperforms Pro on coding; Pro is more consistent.',
      'Claude Sonnet 5': 'Flash is more aligned with Google services; Sonnet is cheaper at intro pricing.',
    },
    relatedModelIds: ['gemini-3-6-flash', 'gemini-3-5-flash-lite'],
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
    vision: true, // docs.x.ai image-understanding guide uses grok-4.5 for image input
    imageGeneration: false, // docs.x.ai routes image creation to the separate Grok Imagine API
    releaseDate: '2026-07-08',
    scores: {
      'swe-bench-verified': 86.6, // Vals independent run (mini-swe-agent, July 2026)
      'swe-bench-pro': 64.7, // xAI-published (July 2026)
      'gpqa-diamond': 93.1, // Artificial Analysis independent run (July 2026)
      'terminal-bench': 83.3, // xAI-published; tbench.ai independent run (Cursor CLI) lands 79.3
      // Independent closed-book run, not xAI's tool-assisted headline result.
      'hle': 52.2,
      'aa-intelligence-index': 54.0, // Artificial Analysis v4.1, high effort
    },
    scoreProvenance: {
      'swe-bench-verified': { source: 'independent', runner: 'Vals AI (mini-swe-agent)' },
      'gpqa-diamond': { source: 'independent', runner: 'Artificial Analysis' },
      'hle': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://benchmarklist.com/models/xai-grok-4-5/',
      },
      'aa-intelligence-index': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://artificialanalysis.ai/models/grok-4-5/',
      },
      'terminal-bench': {
        source: 'provider',
        independentScore: 79.3,
        independentRunner: 'tbench.ai (Cursor CLI)',
      },
    },
    blurb:
      "xAI's brand-new flagship. Strong terminal and coding chops at a mid-tier price, with live access to X (Twitter) data.",
    useCases: ['coding', 'analysis', 'research'],
    whyChooseThis:
      'Grok 4.5 is xAI\'s newest flagship with strong terminal and coding performance. The unique advantage: real-time access to X (Twitter) data. If you need live social insights combined with top-tier reasoning, Grok is the only option.',
    prosVsCompetitors: {
      'GPT-5.6 Sol': 'Grok is cheaper and has X data access; Sol is stronger on terminal tasks.',
      'Claude Opus 4.8': 'Grok has unique Twitter integration; Opus is stronger on pure reasoning.',
    },
    relatedModelIds: ['grok-4-1-fast', 'gpt-5-6-sol'],
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
    // Modality intentionally omitted: xAI retired both API variants on May 15, 2026,
    // and the surviving slugs now redirect to Grok 4.3. The original 4.1 Fast
    // launch material never documented image input or output.
    scores: {
      'swe-bench-pro': 70.0, // xAI-published (July 2026)
      'gpqa-diamond': 85.3, // Artificial Analysis independent reasoning run; replaces non-reasoning 63.7
      'hle': 17.6, // Artificial Analysis independent reasoning run (closed-book)
    },
    scoreProvenance: {
      'gpqa-diamond': { source: 'independent', runner: 'Artificial Analysis' },
      'hle': { source: 'independent', runner: 'Artificial Analysis' },
    },
    blurb:
      'A budget speedster with a huge 2M-token context window. One of the cheapest ways to process large amounts of text.',
    useCases: ['summarization', 'analysis', 'coding'],
    whyChooseThis:
      'Grok 4.1 Fast is an absolute steal for bulk text processing. At $0.20/$0.50, it\'s the cheapest frontier model, and the 2M context is unmatched. Perfect for summarizing books, processing logs, or handling large datasets on a budget.',
    prosVsCompetitors: {
      'Claude Haiku 4.5': 'Grok Fast is 5x cheaper with 10x more context; Haiku is more capable.',
      'Llama 4 Scout': 'Grok Fast is faster and more capable; Scout has slightly more context.',
    },
    relatedModelIds: ['grok-4-5', 'llama-4-scout'],
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
    vision: true, // Meta Model API launch post: natively multimodal, accepts images/video/PDFs
    imageGeneration: false, // same post: text output; Muse Image is the separate image model
    releaseDate: '2026-07-09',
    scores: {
      // Independent x-high mini-SWE-agent evaluation, published 2026-07-13.
      'swe-bench-verified': 82.0,
      'swe-bench-pro': 61.5, // Meta-published; no independent run yet
      'gpqa-diamond': 88.4, // Artificial Analysis independent run (Meta published none)
      'terminal-bench': 76.2, // tbench.ai independent run (mini-SWE-agent); Meta itself published only a 2.0 number
      'hle': 62.1, // BenchLM independent run (July 2026)
    },
    scoreProvenance: {
      'swe-bench-verified': {
        source: 'independent',
        runner: 'BenchmarkList (mini-SWE-agent)',
        sourceUrl: 'https://benchmarklist.com/models/meta-muse-spark-1-1/',
      },
      'gpqa-diamond': { source: 'independent', runner: 'Artificial Analysis' },
      'terminal-bench': { source: 'independent', runner: 'tbench.ai (mini-SWE-agent)' },
      'hle': { source: 'independent', runner: 'BenchLM' },
    },
    blurb:
      "Meta's new flagship and its first paid, closed-weights model after the open Llama era. Built for agent work at an aggressive price.",
    useCases: ['coding', 'analysis', 'writing'],
    whyChooseThis:
      'Muse Spark 1.1 is Meta\'s first foray into paid models, and it\'s aggressively priced at $1.25/$4.25. At that price, it\'s one of the cheapest frontier flagships. The 256K max output is exceptional for generating large documents.',
    prosVsCompetitors: {
      'Claude Sonnet 5': 'At intro pricing, Sonnet is cheaper; Spark is strong but less proven.',
      'GPT-5.6 Terra': 'Spark is cheaper; Terra has broader adoption.',
    },
    relatedModelIds: ['llama-4-maverick', 'claude-sonnet-5'],
  },

  // ─── Moonshot AI ─────────────────────────────────────────────
  {
    id: 'kimi-k3',
    name: 'Kimi K3',
    providerId: 'moonshot',
    tier: 'flagship',
    openSource: false, // open weights promised for 2026-07-27; API-only at research time
    inputPricePerMTok: 3,
    outputPricePerMTok: 15,
    contextWindowTokens: 1_000_000,
    reasoning: true, // always-on reasoning; effort currently fixed at maximum
    internetAccess: true,
    vision: true, // Kimi API platform model list: native visual understanding, visual + text input
    imageGeneration: false, // same docs list text output only
    releaseDate: '2026-07-16',
    scores: {
      'swe-bench-verified': 93.4, // Vals independent run (mini-swe-agent, July 2026)
      'gpqa-diamond': 93.5, // Moonshot-published (July 2026)
      'terminal-bench': 88.3, // Moonshot-published; Vals independent run lands 80.90
      'hle': 56.0, // Moonshot-published (with tools) (July 2026)
      'aa-intelligence-index': 57.0, // Artificial Analysis v4.1
    },
    scoreProvenance: {
      'swe-bench-verified': { source: 'independent', runner: 'Vals AI (mini-swe-agent)' },
      'terminal-bench': {
        source: 'provider',
        independentScore: 80.9,
        independentRunner: 'Vals AI (Terminus 2)',
      },
      'aa-intelligence-index': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://artificialanalysis.ai/models/kimi-k3/',
      },
    },
    blurb:
      "Moonshot AI's brand-new 2.8-trillion-parameter flagship. Frontier scores on agentic and reasoning work, with open weights promised within weeks.",
    useCases: ['coding', 'research', 'analysis'],
    whyChooseThis:
      'Kimi K3 posts some of the strongest published agentic numbers of any model, closed or open, and Moonshot has promised to release the weights — a rare combination of frontier capability now and self-hosting later. The 1M context and native vision make it a strong pick for long-horizon tool-use agents.',
    prosVsCompetitors: {
      'GPT-5.6 Sol': 'K3 is cheaper and matches Sol\'s published terminal scores; Sol has independent verification and a mature ecosystem.',
      'GLM-5.2': 'K3 posts higher published agentic scores; GLM-5.2 is already downloadable and MIT-licensed today.',
    },
    relatedModelIds: ['gpt-5-6-sol', 'glm-5-2'],
  },

  // ─── Open source ─────────────────────────────────────────────
  {
    id: 'inkling',
    name: 'Inkling',
    providerId: 'thinking-machines',
    tier: 'flagship',
    openSource: true,
    license: 'Apache 2.0',
    inputPricePerMTok: null,
    outputPricePerMTok: null,
    contextWindowTokens: 1_000_000,
    reasoning: true,
    internetAccess: false,
    vision: true, // TML launch post: 'Inkling accepts images as input'
    imageGeneration: false, // same post: reasons over text/images/audio, generates text
    releaseDate: '2026-07-15',
    scores: {
      // All figures are Thinking Machines-published (launch eval table, effort=0.99).
      'swe-bench-verified': 77.6,
      'swe-bench-pro': 54.3, // SWE-bench Pro public subset
      'gpqa-diamond': 87.2,
      'terminal-bench': 63.8, // Vals independent run lands 47.57
      'hle': 46.0, // with tools
    },
    scoreProvenance: {
      'terminal-bench': {
        source: 'provider',
        independentScore: 47.57,
        independentRunner: 'Vals AI (Terminus 2)',
      },
    },
    blurb:
      "Thinking Machines' first model: a 975B-parameter open-weights multimodal flagship under Apache 2.0. The leading US open model on real-world coding.",
    useCases: ['coding', 'research', 'analysis'],
    whyChooseThis:
      'Inkling is the strongest US-built open-weights model, and the first flagship from Mira Murati\'s Thinking Machines Lab. It handles text, images, and audio natively, and the Apache 2.0 license is as business-friendly as it gets. Weights are on Hugging Face, with hosted APIs available from several providers.',
    prosVsCompetitors: {
      'GLM-5.2': 'Inkling leads on SWE-bench coding and is natively multimodal; GLM-5.2 is stronger on science reasoning and terminal work.',
      'DeepSeek V4 Pro': 'Inkling adds vision and audio; DeepSeek edges it on pure coding benchmarks.',
    },
    relatedModelIds: ['glm-5-2', 'deepseek-v4-pro'],
  },
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
    vision: false, // Z.AI GLM-5.2 model card is text-generation only (third-party 'multimodal' claims contradict it)
    imageGeneration: false, // same card: text output only
    scores: {
      'swe-bench-pro': 62.1,
      'gpqa-diamond': 91.2,
      'terminal-bench': 81.0, // Z.AI-published; Vals independent run lands 67.79
      // Z.AI publishes both protocols: 54.7 with tools, 40.5 closed-book. The
      // column is closed-book across the dataset, so the 40.5 run is the
      // comparable one.
      'hle': 40.5,
    },
    scoreProvenance: {
      'terminal-bench': {
        source: 'provider',
        independentScore: 67.79,
        independentRunner: 'Vals AI (Terminus 2)',
      },
    },
    blurb:
      'The current #1 open-source model. Frontier-level science reasoning you can download and run yourself, MIT-licensed.',
    useCases: ['research', 'coding', 'analysis'],
    whyChooseThis:
      'GLM-5.2 is the strongest open-source model available. It beats most closed-source competitors on GPQA reasoning and has respectable coding scores. MIT-licensed means you can use it anywhere, from your laptop to production servers.',
    prosVsCompetitors: {
      'DeepSeek V4 Pro': 'GLM-5.2 has better reasoning; DeepSeek is slightly cheaper to self-host.',
      'Claude Opus 4.8': 'Opus is more capable but costs $5-25 per million tokens; GLM is free to run.',
    },
    relatedModelIds: ['deepseek-v4-pro', 'qwen-3-6'],
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
    vision: false, // DeepSeek-V4-Pro model card: text-generation MoE, no image input
    imageGeneration: false, // same card: text output only
    scores: {
      // DeepSeek technical report figures for V4 Pro in "Think Max" mode.
      'swe-bench-verified': 80.6,
      'swe-bench-pro': 55.4,
      'gpqa-diamond': 90.1, // independently reproduced by NIST/CAISI
      'terminal-bench': 67.9, // DeepSeek-published (max reasoning); Vals independent run lands 50.19
      // Tech report gives 37.7 closed-book and 48.2 with tools; the column is
      // closed-book across the dataset.
      'hle': 37.7,
      'aa-intelligence-index': 44.0, // Artificial Analysis v4.1, max reasoning effort
    },
    scoreProvenance: {
      'gpqa-diamond': {
        source: 'provider',
        independentScore: 90.1,
        independentRunner: 'NIST CAISI',
      },
      'terminal-bench': {
        source: 'provider',
        independentScore: 50.19,
        independentRunner: 'Vals AI (Terminus 2)',
      },
      'aa-intelligence-index': {
        source: 'independent',
        runner: 'Artificial Analysis',
        sourceUrl: 'https://artificialanalysis.ai/models/deepseek-v4-pro/',
      },
    },
    blurb:
      'An open-source powerhouse for code and math. Free to self-host under an MIT license.',
    useCases: ['coding', 'research', 'debugging'],
    whyChooseThis:
      'DeepSeek V4 Pro excels at coding and mathematical reasoning in open-source form. It scores in the 80s on SWE-Bench coding tasks and competes with closed-source flagships. Perfect for teams who need frontier-level capability without vendor lock-in.',
    prosVsCompetitors: {
      'GLM-5.2': 'DeepSeek is slightly cheaper to compute; GLM-5.2 is slightly more capable.',
      'Claude Opus 4.8': 'Opus is closed-source and costs $5-25 per million tokens; DeepSeek is free.',
    },
    relatedModelIds: ['glm-5-2', 'qwen-3-6'],
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
    vision: true, // Qwen3.6-35B-A3B card: image-text-to-text, 'Causal Language Model with Vision Encoder'
    imageGeneration: false, // same card: text output only
    scores: {
      // Alibaba-published figures for Qwen3.6-35B-A3B, the flagship open release.
      'swe-bench-verified': 73.4,
      'swe-bench-pro': 49.5,
      'gpqa-diamond': 86.0,
      'terminal-bench': 61.6, // Alibaba-published (Qwen 3.6 Plus) (July 2026)
      'hle': 21.4, // BenchLM independent run for Qwen3.6-35B-A3B (July 2026)
    },
    scoreProvenance: {
      'hle': { source: 'independent', runner: 'BenchLM' },
    },
    blurb:
      'The leading open model for multilingual work, under the business-friendly Apache 2.0 license.',
    useCases: ['writing', 'translation', 'analysis'],
    whyChooseThis:
      'Qwen 3.6 is the go-to open model for multilingual tasks and businesses that need liberal licensing. Apache 2.0 is friendly for commercial use, and Qwen is strong across 100+ languages. Great for global teams.',
    prosVsCompetitors: {
      'GLM-5.2': 'GLM is stronger on reasoning; Qwen is better for multilingual tasks.',
      'Llama 4 Maverick': 'Qwen is more capable; Llama is more widely deployed.',
    },
    relatedModelIds: ['glm-5-2', 'deepseek-v4-pro'],
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
    vision: true, // Llama 4 Maverick card: input modalities 'Multilingual text and image'
    imageGeneration: false, // same card: output modalities 'Multilingual text and code'
    scores: {
      'gpqa-diamond': 69.8, // Meta-published (April 2026)
    },
    blurb:
      "Meta's general-purpose open model. Easy to run and widely supported, though newer open models beat it on hard reasoning.",
    useCases: ['writing', 'analysis', 'summarization'],
    whyChooseThis:
      'Llama 4 Maverick is the most widely supported open model in the ecosystem. Thousands of tools integrate with it, and it runs efficiently on consumer hardware. If compatibility and ease-of-use matter more than peak performance, Llama is the safe choice.',
    prosVsCompetitors: {
      'GLM-5.2': 'GLM is more capable on reasoning; Llama has broader tool support.',
      'Qwen 3.6': 'Qwen is stronger on multilingual; Llama is more universally compatible.',
    },
    relatedModelIds: ['llama-4-scout', 'muse-spark-1-1'],
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
    vision: true, // Llama 4 Scout card: input modalities 'Multilingual text and image'
    imageGeneration: false, // same card: output modalities 'Multilingual text and code'
    scores: {
      'gpqa-diamond': 57.2, // Meta-published (April 2026)
    },
    blurb:
      'The long-context champion. A 10-million-token window, enough to read hundreds of books at once.',
    useCases: ['analysis', 'summarization', 'research'],
    whyChooseThis:
      'Scout has the largest context window of any model—10 million tokens. That\'s enough to load an entire codebase, hundreds of documents, or several books at once. Perfect for long-context retrieval and bulk processing tasks.',
    prosVsCompetitors: {
      'Llama 4 Maverick': 'Scout has 10x more context but is less capable on reasoning; Maverick is more general.',
      'Grok 4.1 Fast': 'Scout is slightly longer (10M vs 2M) and more capable; Grok is cheaper.',
    },
    relatedModelIds: ['llama-4-maverick', 'grok-4-1-fast'],
  },
]
