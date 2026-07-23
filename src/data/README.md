# Models.fyi data layer

All model and benchmark data is static and hardcoded here. This is deliberate
(see the root README): no database until the product needs one.

## Layout

| File | Contents |
|---|---|
| `types.ts` | The schema. Start here. |
| `providers.ts` | AI companies / open-source orgs |
| `benchmarks.ts` | Benchmarks with plain-language (ELI5) descriptions |
| `models.ts` | The models: pricing, context windows, capabilities, scores |
| `index.ts` | Public entry point. Import from here only. |

## Rules

- **Never write facts from memory.** Every price, context window, and score
  must come from a source checked at refresh time (provider docs, leaderboards).
- **Missing beats fabricated.** If no reliable published score exists, omit the
  key from `scores`. The UI renders it as "—".
- Prices are USD per 1M tokens, list price (ignore short-term intro discounts).
- Open-source models have `null` prices (hosting cost varies by vendor).

## Refresh process

Follow the skill at `.agents/skills/refreshing-model-data/SKILL.md`. It carries
the full workflow, the maintained source registry, and the self-improvement
rules; the short version:

1. Re-research each provider's current lineup, pricing, and context windows
   (provider docs first, then leaderboards such as vals.ai, llm-stats.com,
   artificialanalysis.ai for scores).
2. Update `models.ts` / `benchmarks.ts` / `providers.ts`.
3. Bump `dataSourcedAt` in `index.ts`.
4. Run `npm run validate` (schema + sanity checks; also runs in CI).

Last refreshed: **2026-07-23, seventh pass** (four independently measured
Artificial Analysis Intelligence Index results added for exact model and
effort configurations).

2026-07-23 release-date backfill notes:

- **Ten missing `releaseDate` values backfilled**, each from a verifiable
  public source (provider announcements first, dated launch coverage where
  the provider page publishes no date). All 21 models now carry one:
  - Claude Fable 5, **2026-06-09**:
    [Anthropic's launch announcement](https://www.anthropic.com/news/claude-fable-5-mythos-5)
    (the model was paused June 12 under the export directive and
    [redeployed July 1](https://www.anthropic.com/news/redeploying-fable-5);
    the date shown is the original release).
  - Claude Opus 4.8, **2026-05-28**:
    [Anthropic's launch announcement](https://www.anthropic.com/news/claude-opus-4-8).
  - Claude Haiku 4.5, **2025-10-15**:
    [Anthropic's launch announcement](https://www.anthropic.com/news/claude-haiku-4-5).
  - Gemini 3.1 Pro, **2026-02-19**:
    [Google's launch blog](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/),
    which states 3.1 Pro rolled out in preview the same day.
  - Grok 4.1 Fast, **2025-11-19**:
    [xAI's launch announcement on X](https://x.com/xai/status/1991284813727474073)
    introducing Grok 4.1 Fast and the Agent Tools API, corroborated by
    [dated launch coverage](https://www.eonmsk.com/2025/11/19/xai-grok-4-1-fast/).
  - GLM-5.2, **2026-06-13**: Z.AI's Coding Plan launch, per
    [dated launch coverage](https://www.kucoin.com/news/flash/zhipu-ai-launches-glm-5-2-with-1m-context-support-api-and-open-source-release-scheduled-for-next-week);
    the MIT weights and standalone API followed June 17.
  - DeepSeek V4 Pro, **2026-04-24**:
    [DeepSeek's V4 Preview release note](https://api-docs.deepseek.com/news/news260424/)
    (V4-Pro and V4-Flash open-sourced that day).
  - Qwen 3.6, **2026-04-16**:
    [the QwenLM GitHub news log](https://github.com/QwenLM/Qwen3.6)
    ("2026-04-16: Qwen3.6-35B-A3B is now available on Hugging Face Hub").
  - Llama 4 Maverick and Llama 4 Scout, **2025-04-05**: Meta's "Llama 4
    herd" launch announcement, corroborated by
    [dated launch coverage](https://www.idlen.io/news/meta-llama-4-scout-maverick-open-weight-multimodal-moe-10m-context/).
- Dates record the provider's original public release of the model. Later
  redeployments, weights drops, and GA re-announcements are noted in the
  entries above where they exist.
- The `releases.ts` Fable 5 What's New entry previously said 2026-07-15, a
  date no source supports. It now reads 2026-06-09 to match the sourced
  launch (the schema validator requires launch entries to agree with
  `releaseDate`), links to the verified announcement URL, and notes the
  June 12 pause and July 1 restoration in its description.

2026-07-23 seventh-pass refresh notes:

- **Four Intelligence Index gaps filled.** Artificial Analysis v4.1 now
  publishes directly comparable results for Claude Sonnet 5 (**53**, adaptive
  reasoning / max effort), GPT-5.6 Terra (**55**, max effort), GPT-5.6 Luna
  (**46**, high effort), and DeepSeek V4 Pro (**44**, max effort). Each score
  is independently measured, links to its model-level source, and uses the
  documented reasoning configuration rather than a non-reasoning variant.
- **Grok 4.1 Fast remains omitted from this column.** Artificial Analysis
  labels its 31-point reasoning result an estimate, rather than an independent
  evaluation. Per the data-layer rule, it is not comparable enough to publish.
- **The broader provider and leaderboard sweep found no further eligible
  changes.** OpenAI reconfirms the displayed GPT-5.6 GPQA Diamond, SWE-bench
  Pro, and Terminal-Bench 2.1 values, including Terra's 87.4 and Luna's 84.7.
  Moonshot continues to list Kimi K3 as API-only until its scheduled July 27
  weights release. Empty benchmark cells remain omitted rather than inferred.
- **Quiz audit:** recommendations and score explanations are derived from the
  canonical `models` array. There is no duplicate quiz score data to update.

Sources checked 2026-07-23: [Claude Sonnet 5](https://artificialanalysis.ai/models/claude-sonnet-5/),
[GPT-5.6 Terra](https://artificialanalysis.ai/models/gpt-5-6-terra/),
[GPT-5.6 Luna](https://artificialanalysis.ai/models/gpt-5-6-luna-high/),
[DeepSeek V4 Pro](https://artificialanalysis.ai/models/deepseek-v4-pro/),
[OpenAI's GPT-5.6 evaluation table](https://openai.com/index/gpt-5-6/), and
[Moonshot AI's Kimi K3 page](https://www.moonshot.ai/).

2026-07-22 fifth-pass refresh notes:

- **Artificial Analysis Intelligence Index added.** This actively refreshed,
  points-based composite combines nine current evaluations, including
  Terminal-Bench 2.1, HLE, GPQA Diamond, real-world work, tool-use, and
  long-context tests. It appears as a distinct `pts` column so it cannot be
  confused with a percentage. Initial independently measured scores are
  included only where the exact model and effort configuration is published;
  the score popover links to each live result.

- **Two independently measured gaps are now filled with score-level links.**
  Grok 4.5 scores **52.2** on closed-book HLE, and Muse Spark 1.1 scores
  **82.0** on SWE-bench Verified (x-high mini-SWE-agent). The comparison
  score popover now links directly to the result page for both values rather
  than only the benchmark's general documentation.
- **The remaining empty cells remain empty.** The previous sweep's primary
  source checks still rule out the available near-matches: unsupported
  benchmark versions, different model variants, tool-assisted-only results,
  and figures with no reproducible harness. This is deliberate: the site
  shows "—" instead of turning an incomparable score into a false comparison.

Sources: [Grok 4.5 benchmark results](https://benchmarklist.com/models/xai-grok-4-5/)
and [Muse Spark 1.1 benchmark results](https://benchmarklist.com/models/meta-muse-spark-1-1/),
checked 2026-07-22.

2026-07-22 sixth-pass refresh notes:

- **Gemini 3.1 Pro Terminal-Bench 2.1 corrected from 70.79 to 73.8.** The
  prior independent Vals result has been superseded in the canonical dataset
  by Google's provider-published Terminus-2 result from its current Gemini
  comparison table. The explicit provider score follows this dataset's
  provider-wins convention, so the old independent-run provenance is removed.
- **No new broadly available general-purpose model was added.** Gemini 3.5
  Flash Cyber launched on July 21, but Google limits it to a government and
  trusted-partner CodeMender pilot. The current general-purpose additions,
  Gemini 3.6 Flash and Gemini 3.5 Flash-Lite, were already included in the
  July 21 refresh. Google still publishes no comparable SWE-bench Verified,
  GPQA Diamond, or HLE score for either new public model.
- **Quiz audit:** the quiz has no duplicated scores or static model-ranking
  options; it derives every recommendation and score explanation from the
  canonical `models` array. No separate quiz-data edit is needed.

Sources: [Google's current Gemini comparison table](https://deepmind.google/models/gemini/),
[the July 21 Gemini launch](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/),
and provider and leaderboard rechecks for the current OpenAI, Anthropic, Meta,
and open-model lineups, checked 2026-07-22.

2026-07-21 refresh notes:

- **Gemini 3.6 Flash added** from Google's GA launch and model documentation:
  $1.50/$7.50 per million input/output tokens, 1,048,576-token input and
  65,536-token output limits, SWE-bench Pro public 58.7, and Terminal-Bench
  2.1 78.0 using the Terminus-2 harness.
- **Gemini 3.5 Flash-Lite added** as Google's new high-throughput tier:
  $0.30/$2.50 per million input/output tokens, the same input/output limits,
  SWE-bench Pro public 54.2, and Terminal-Bench 2.1 54.0.
- Google published no comparable SWE-bench Verified, GPQA Diamond, or HLE
  numbers for either release, so those scores remain absent. Gemini 3.5 Flash
  Cyber is restricted to government and trusted-partner deployments and was
  excluded from the general-purpose comparison.

Sources used (2026-07-21): blog.google (official launch),
deepmind.google/models/gemini (official comparison table and methodology),
and ai.google.dev/gemini-api/docs (GA status, model IDs, prices, capabilities,
and token limits). Artificial Analysis, Vals AI, the LMSYS Chatbot Arena, and
the Hugging Face Open LLM Leaderboard were checked for independent scores;
none had comparable runs for the two models at refresh time.

2026-07-20 fourth-pass refresh notes (new leaderboard results):

- **Three empty cells filled.** Artificial Analysis now reports closed-book HLE
  runs for GPT-5.6 Terra (41.8, max effort), GPT-5.6 Luna (37.2, medium effort),
  and Grok 4.1 Fast Reasoning (17.6). Each carries explicit independent-run
  provenance.
- **Grok 4.1 Fast GPQA corrected from 63.7 to 85.3.** The old value no longer
  matches the model row: it came from Artificial Analysis's non-reasoning
  record, while `models.ts` describes the reasoning variant. The matching
  reasoning run is 85.2525, rounded to 85.3; its HLE result comes from the same
  record.
- **Nineteen cells stay empty.** OpenAI still publishes no SWE-bench Verified
  or HLE result for Terra and no HLE result for Luna. Anthropic's Haiku
  Terminal-Bench result does not name benchmark version 2.1, so it remains
  excluded; conflicting GPQA values (74.1/73.0/67.2/67) still have no
  unambiguous source for the tracked variant, and no reliable Haiku SWE-bench
  Pro or HLE result was found. Meta's
  Llama 4 card still publishes none of the four missing coding/terminal/HLE
  cells for Scout or Maverick.
- **Rejected near-matches:** Scout HLE figures of 4.3/6.0 and coding figures of
  35/25/20 lack a reproducible matching harness; Terminal-Bench Hard or 2.0
  results cannot populate the 2.1 column; GLM-5.2's apparent SWE-bench Verified
  77.8 result belongs to the older GLM-5 model. Scale AI's Maverick HLE 5.68 is
  a public multimodal-set result rather than the closed-book protocol used by
  this column, so it remains omitted.

Sources used (2026-07-20 fourth pass): artificialanalysis.ai model records and
Humanity's Last Exam leaderboard, anthropic.com/news/claude-haiku-4-5,
labs.scale.com/leaderboard/humanitys_last_exam, openai.com/index/gpt-5-6,
github.com/meta-llama/llama-models MODEL_CARD.md, vals.ai, and tbench.ai.

2026-07-20 third-pass refresh notes (empty-cell sweep):

- **One cell filled of 23 attempted, and that is the correct outcome.** This
  pass targeted every empty cell in the 5-benchmark grid. Primary sources
  showed that 22 of them are empty because the number does not exist, not
  because nobody had looked. Filling them would have required inventing data.
- **Gemini 3.1 Pro HLE = 44.4**, from the DeepMind model card's explicit
  "No tools" column. This settles the 44.4-vs-51.4 ambiguity the second pass
  recorded as unresolvable: 51.4 is the same row's "Search (blocklist) +
  Code" figure. Closed-book wins per the column convention, and because it is
  provider-published it takes no `scoreProvenance` entry.
- **Llama 4 Maverick and Scout (8 cells) are unfillable at the source.**
  Meta's own `llama-models` MODEL_CARD.md publishes neither SWE-bench
  Verified, SWE-bench Pro, Terminal-Bench, nor HLE for either model; its
  instruction-tuned table tops out at LiveCodeBench. A search digest claiming
  "Maverick 74.2 on SWE-bench Verified" is fabricated; a sibling result in
  the same search reported Maverick at 8.0 on SWE-bench *Lite*, and Verified
  is the easier set, so 74.2 is not merely unsourced but incoherent.
- **Haiku 4.5 (4 cells) reconfirmed unpublished.** Anthropic's announcement
  carries SWE-bench Verified 73.3 and a Terminal-Bench figure only. The
  Terminal-Bench number (40.21 no-thinking / 41.75 at 32K) names no version,
  and we track 2.1 exclusively, so it stays excluded rather than converted.
  Circulating third-party GPQA values (74.1 / 73.0 / 67.2 / 67) still
  conflict and still have no verifiable leaderboard entry.
- **Grok 4.5 HLE stays omitted; near-miss worth recording.** Searches for it
  return *Grok 4* numbers (25.4-26.9 closed-book, 41.0 with tools, 50.7
  Heavy). Different model; using them would have been a silent substitution.
  Artificial Analysis's HLE leaderboard has no Grok 4.5 row.
- **Terra/Luna HLE and Terra SWE-bench Verified stay omitted.** openai.com
  now returns HTTP 403 to fetches, and the Artificial Analysis HLE
  leaderboard lists no Terra or Luna row. That leaderboard's three entries
  (Fable 5 53.3, Sol 47.2, Opus 4.8 45.7) match `models.ts` exactly, which
  re-verifies those existing values.
- **GLM-5.2 SWE-bench Verified does not exist.** Z.AI's own docs quote only
  "81.0 vs 62.0 on Terminal-Bench 2.1 and 62.1 vs 58.4 on SWE-bench Pro".
- **Muse Spark 1.1 SWE-bench Verified** was not published at launch; Meta's
  report gives SWE-bench Pro 61.5 and DeepSWE 53.3.
- **Kimi K3 SWE-bench Pro** reconfirmed absent: Moonshot's launch table uses
  DeepSWE, FrontierSWE, ProgramBench, and SWE Marathon instead.

Sources used (2026-07-20 third pass):
deepmind.google/models/model-cards/gemini-3-1-pro (HLE no-tools column),
github.com/meta-llama/llama-models MODEL_CARD.md (Llama 4 eval tables),
anthropic.com/news/claude-haiku-4-5 (Haiku eval methodology),
docs.z.ai/guides/llm/glm-5.2 (GLM-5.2 benchmark line),
artificialanalysis.ai/evaluations/humanitys-last-exam (HLE leaderboard
roster), plus web searches for Muse Spark 1.1 and Kimi K3 eval tables.

2026-07-20 capability-pass refresh notes (vision / imageGeneration):

- **Why this pass happened:** `vision` and `imageGeneration` were declared in
  `types.ts` and read by the `/compare` capability filters, but *no* model set
  either one. The Vision chip therefore emptied the comparison table, and
  `ModelCard`'s `👁️ vision` badge was unreachable. Both fields are now set
  from provider documentation, with the source in an inline comment.
- **Vision = true for 16 models**, each from a first-party modality table:
  all four Claude models (the Anthropic models overview states plainly that
  "All current Claude models support text and image input, text output,
  multilingual capabilities, and vision"); all three GPT-5.6 tiers (OpenAI's
  models docs: "All latest OpenAI models support text and image input, text
  output, multilingual capabilities, and vision"); Gemini 3.1 Pro and 3.5
  Flash (Gemini API model cards, inputs "Text, Image, Video, Audio, and
  PDF"); Grok 4.5; Muse Spark 1.1; Kimi K3; Inkling; Qwen3.6-35B-A3B; and
  Llama 4 Maverick and Scout.
- **Vision = false for two**, on the strength of their own model cards:
  GLM-5.2 and DeepSeek V4 Pro are both plain text-generation models. Note
  these are recorded as explicit `false`, not omissions; the provider card
  positively establishes the absence, which is different from "unknown".
- **imageGeneration is false for all 18 models we could source.** Every
  provider that documents an output modality lists text only, and each one
  that offers image generation routes it to a *separate* model: OpenAI to
  GPT Image 2, xAI to the Grok Imagine API, Meta to Muse Image. No model in
  this dataset emits images.
- **The image-generation filter was removed rather than faked.** Since no
  model satisfies it, leaving the chip on `/compare` would only ever blank
  the table. `hasCapability` still handles the `image-generation` id and the
  `Model.imageGeneration` field stays, so restoring the chip is a one-line
  change the day an image model joins. The `🎨 image gen` badge was likewise
  not added to `ModelCard`, because it would be dead markup today.
- **Regression guard added** in `src/lib/capabilityFilters.test.ts`: every
  entry in `capabilityOptions` must match at least one model in the real
  dataset (imported from `../data/index.ts`, not mocked). Any future filter
  that goes dead now fails CI instead of silently emptying the table.
- **Omitted for lack of a source: `grok-4-1-fast`.** Secondary sources
  (MindStudio, TypingMind, Oracle's model docs) all describe it as accepting
  text and image, but xAI's current `docs.x.ai/developers/models` table no
  longer lists the model at all. xAI subsequently confirmed that both 4.1 Fast
  API variants were retired on May 15, 2026; their slugs now redirect to Grok
  4.3, whose model card cannot establish the historical model's capabilities.
  The original 4.1 Fast launch post documents context, pricing, and tools but
  no image modality. Per "missing beats fabricated" both keys remain omitted
  rather than inheriting Grok 4.3's `Text, Image` input declaration. Grok 4.5
  itself is confirmed by xAI's image-understanding guide, whose examples pass
  images to `grok-4.5`.
- **Rejected lead:** several third-party pages (MindStudio, Gate.AI) call
  GLM-5.2 multimodal. Z.AI's own model card lists it under Text Generation
  with no image input, and NVIDIA's mirror of the card lists text-only input
  types. The provider card wins; GLM-5.2 is recorded `vision: false`.
2026-07-20 second-pass refresh notes:

- **HLE column filled for five models**, all closed-book to match the
  existing entries: Gemini 3.5 Flash 40.2 (Google model card), GLM-5.2 40.5
  (Z.AI), DeepSeek V4 Pro 37.7 (tech report), Qwen3.6-35B-A3B 21.4 (BenchLM),
  and Inkling's 46.0 kept as published.
- **Protocol trap avoided on two models.** Z.AI reports GLM-5.2 at 54.7 *with
  tools* and 40.5 closed-book; DeepSeek reports 48.2 with tools and 37.7
  closed-book. The aggregators quote the headline tool-assisted numbers,
  which would have overstated GLM by 14 points against closed-book neighbours
  like Opus 4.8 (45.7). Both closed-book figures were used instead.
- **Gemini 3.5 Flash GPQA re-attributed.** The 92.2 carried a
  "Google-published" comment, but the official model card publishes no GPQA
  at all; the number is an Artificial Analysis run, now marked independent.
  The same card confirms its Terminal-Bench 76.2 *is* a 2.1 result
  (Terminus-2 harness), contradicting secondary coverage that called it 2.0,
  so the score stands and the convention is not violated.
- **Terminal-Bench divergences recorded** from the July 16 Vals AI Terminus 2
  run for Gemini 3.5 Flash (74.16), GLM-5.2 (67.79), DeepSeek V4 Pro (50.19),
  and Inkling (47.57). Provider numbers stay per the convention.
- **Rejected leads:** Gemini 3.1 Pro's HLE is quoted as both 44.4 and 51.4 by
  different sources with no provider figure to settle it, so it stays
  omitted. Grok 4.5 has no isolated HLE score (only its position in
  Artificial Analysis's composite index), so it stays omitted too. Kimi K3's
  "95.10 SWE-bench Verified" is the Vals *Index subset*, a different harness
  from the 93.4 mini-swe-agent run already recorded, not an update to it.
- Checked and unchanged: no new frontier releases July 17-20 (llm-stats
  release feed); Gemini 3.5 Pro still not GA (still no model card or pricing;
  now rumoured to August); Kimi K3 open weights still promised for 07-27.

2026-07-20 refresh notes:

- **GPT-5.6 GPQA corrected from OpenAI's GA table:** Sol is 94.6, Terra is
  92.9, and Luna is 92.3. Sol previously showed an older Artificial Analysis
  run (94.1), while Terra and Luna were missing. OpenAI still publishes no
  SWE-bench Verified scores for the family.
- **Vals AI coding runs backfilled:** its July 17 uniform mini-swe-agent
  SWE-bench Verified run reports Sol 96.2, Kimi K3 93.4, Luna 93.0, and Grok
  4.5 86.6. Its July 16 Terminus 2 Terminal-Bench run provides independent
  comparisons for Sol (85.77), Kimi K3 (80.90), and Luna (79.03); provider
  scores remain displayed where available. Luna's earlier tbench.ai Codex run
  was 75.7, but the provenance UI currently presents one independent
  counterpart, so it now shows the newer Vals run.
- Checked and unchanged: no post-July-19 tbench.ai entries for Kimi K3,
  Inkling, GPT-5.6 Sol, DeepSeek V4 Pro, Qwen 3.6, GLM-5.2, or Haiku 4.5;
  Kimi K3 weights remain promised for July 27; Gemini 3.5 Pro remains
  unreleased and no official Gemini 3.6 model is listed.

Sources used (2026-07-20): openai.com/index/gpt-5-6 (official GA eval
table), vals.ai/benchmarks/swebench (updated July 17),
vals.ai/benchmarks/terminal-bench-2-1 (updated July 16), tbench.ai,
ai.google.dev/gemini-api/docs/models, deepmind.google/models/gemini, and
anthropic.com/news/claude-haiku-4-5.

2026-07-19 refresh notes:

- **Kimi K3 added as Moonshot AI's flagship** (released 2026-07-16: 2.8T-param
  sparse MoE, 1M context, native vision, always-on reasoning, $3/$15).
  GPQA Diamond 93.5, Terminal-Bench 2.1 88.3, and HLE 56.0 (with tools) are
  all Moonshot-published; no independent runs yet (K3 is absent from
  tbench.ai's 17-row leaderboard). Moonshot publishes no SWE-bench
  Verified/Pro (its launch table uses DeepSWE/ProgramBench/FrontierSWE
  instead). Open weights are promised by 2026-07-27; flip `openSource`
  and null the prices if that lands.
- **Inkling added as Thinking Machines' first model** (released 2026-07-15:
  975B MoE / 41B active, Apache 2.0 open weights on Hugging Face, up to 1M
  context, multimodal text/image/audio). All scores are from TML's launch
  eval table (effort=0.99): SWE-bench Verified 77.6, SWE-bench Pro public
  54.3, GPQA Diamond 87.2, Terminal-Bench 2.1 63.8, HLE 46.0 (with tools).
  Prices are null per the open-weights convention (hosted APIs exist on
  Together/Fireworks/Modal/Databricks/Baseten at varying rates).
- **Gemini 3.5 Pro did NOT ship on July 17.** Bloomberg and 9to5Google
  (July 16) report the launch slipped again (the third missed deadline)
  over coding-benchmark shortfalls and hallucination issues; Google may ship
  a stopgap "Gemini 3.6 Flash" instead. Several aggregator articles claiming
  a July 17 GA are churn: deepmind.google still lists 3.5 Pro as "coming
  soon", there is no model card, and the Gemini API pricing page lists only
  gemini-3.5-flash and gemini-3.1-pro-preview. Still excluded.
- **Haiku 4.5 GPQA re-verified as unpublished**: Anthropic's announcement
  publishes SWE-bench Verified 73.3 and Terminal-Bench only; third-party
  GPQA numbers still conflict (73.0 / 67.2 / 67). Stays omitted.
- Checked and unchanged: tbench.ai still has no GPT-5.6 Sol, Grok 4.1 Fast,
  GLM-5.2, DeepSeek V4 Pro, or Qwen 3.6 entries; existing annotated runs
  (Opus 4.8 78.9, Sonnet 5 74.6, Terra 78.4, Luna 75.7, Grok 4.5 79.3,
  Muse Spark 76.2, Gemini 3.1 Pro 65.8) match our inline comments.

Sources used (2026-07-19): thinkingmachines.ai/news/introducing-inkling
(full Inkling eval table), artificialanalysis.ai + venturebeat.com +
ghacks.net (Inkling launch coverage, license, params), openrouter.ai +
benchlm.ai + morphllm.com (Kimi K3 pricing/specs/Moonshot-published scores),
tbench.ai (Terminal-Bench 2.1 leaderboard recheck), bloomberg.com +
9to5google.com + techtimes.com (Gemini 3.5 Pro delay), ai.google.dev +
deepmind.google (Gemini API/model-card recheck), anthropic.com/news
(Haiku 4.5 GPQA recheck), llm-stats.com (July 14-19 release news).

2026-07-14 second-pass refresh notes:

- **Annotated Anthropic Terminal-Bench numbers with tbench.ai Claude Code
  runs.** Opus 4.8's published 74.6 (Terminus 2, per its system card) has an
  independent Claude Code run at 78.9; Sonnet 5's published 80.4 has a
  Claude Code run at 74.6. Scores unchanged per the provider-wins
  convention; inline comments added. (We also verified the published
  numbers against launch coverage; the 80.4/74.6 pair looked like a
  possible row-misalignment from the leaderboard, but both are genuinely
  Anthropic-published: Sonnet 5 announcement and Opus 4.8 system card
  §8.3.)
- **Rejected leads:** an llm-stats.com search snippet claimed "Gemini 3.2
  Pro", "DeepSeek V4.5", and "Llama 5" joined the July leaderboards; all
  three are phantom names (no such releases exist; Llama 5 was already
  debunked 7/13 as a misnaming of Muse Spark 1.1). A Lushbinary post cites
  "GPT-5.6 Sol Ultra 91.9" on Terminal-Bench 2.1; that is a max-effort
  config from a secondary source; Sol's 88.8 OpenAI-published number stays.
- **Sonnet 5 intro pricing ignored:** $2/$10 promotional pricing runs until
  2026-08-31, but per convention we list the $3/$15 list price.
- Checked and unchanged: Gemini 3.5 Pro still not GA (still no model card,
  docs, or pricing; reporting still points at July 17); no new flagship
  releases July 14 (news is business-side: OpenAI/government stake, TSMC,
  Anthropic IPO prep); GPT-5.6 Sol still absent from tbench.ai; Terra/Luna
  GPQA still unpublished (Artificial Analysis shows only composite index);
  Sol SWE-bench Verified still unpublished; no 2.1 runs yet for DeepSeek V4
  Pro / Qwen 3.6 / GLM-5.2 / Grok 4.1 Fast.

2026-07-14 morning refresh notes:

- **tbench.ai now has official Terminal-Bench 2.1 runs for the models we
  were watching.** Muse Spark 1.1 gained a score (76.2, mini-SWE-agent),
  previously omitted because Meta had published only a 2.0 run. Grok 4.5
  (79.3, Cursor CLI), GPT-5.6 Terra (78.4, Codex), and Luna (75.7, Codex)
  got independent runs that land well below the providers' self-reported
  numbers; per the convention above the provider numbers stay, with the
  independent runs noted in inline comments. GPT-5.6 Sol is still absent
  from the leaderboard.
- **Rejected lead:** a search snippet attributed "74 on SWE-bench Verified,
  NIST CAISI-verified" to GPT-5.6 Terra; the underlying article (o-mega.ai)
  actually says that figure is CAISI's DeepSeek V4 Pro run. Nothing added.
- Checked and unchanged: OpenAI still publishes no GPQA/SWE-bench Verified
  for the GPT-5.6 family; Haiku 4.5 GPQA still has no verifiable source
  (benchlm.ai shows none); Gemini 3.5 Pro still not GA (no model card,
  docs, or pricing; reporting now points at July 17); no new flagship
  releases July 13-14; no 2.1 runs yet for DeepSeek V4 Pro / Qwen 3.6 /
  GLM-5.2 / Grok 4.1 Fast.

2026-07-13 second-pass refresh notes:

- **Muse Spark 1.1 added as Meta's flagship** (released 2026-07-09 by Meta
  Superintelligence Labs, `muse-spark-1.1`, $1.25/$4.25, 1M context, 256K max
  output, reasoning with adjustable effort). It is closed-weights on the new
  Meta Model API (Meta's pivot away from open-weights Llama), so the `meta`
  provider is now `openSource: false` while the Llama 4 models keep their
  model-level open flags (they remain Meta's newest open weights). SWE-bench
  Pro 61.5 is Meta-published; GPQA Diamond 88.4 is an Artificial Analysis
  independent run; Terminal-Bench is omitted because Meta published only a
  2.0 run (80.0) and we track 2.1 only. Meta published no SWE-bench Verified.
  Note: several outlets covered this release as "Llama 5"; that name is
  wrong; Wikipedia and deeplearning.ai confirm the Llama line ended at 4.
- Meta was also added to the quiz's company-preference options now that it
  sells API access like the other closed providers.
- Checked and unchanged: no new tbench.ai Terminal-Bench 2.1 entries for our
  models beyond what the morning pass recorded (Grok 4.5 and GPT-5.6 still
  absent from the official leaderboard); GPT-5.6 Terra/Luna GPQA still
  unpublished (Artificial Analysis shows only composite index scores);
  Gemini 3.5 Pro is still unreleased (third-party reports point at July 17
  with no official Google model card, docs, or pricing; excluded until GA).

2026-07-13 morning refresh notes:

- **Grok 4.5 replaced Grok 4.3** as xAI's flagship (launched 2026-07-08,
  `grok-4.5`, $2/$6, 500K context; long-context requests above 200K bill
  higher). Its SWE-bench Pro (64.7) and Terminal-Bench 2.1 (83.3) numbers are
  xAI self-reported with no independent verification yet; GPQA (93.1) is an
  Artificial Analysis run. xAI published no SWE-bench Verified.
- **GPQA backfill from Artificial Analysis independent runs:** GPT-5.6 Sol
  94.1, Claude Sonnet 5 91.1. OpenAI's circulating 94.6 for Sol is still not
  on any openai.com page, so it remains excluded.
- **Claude Haiku 4.5 GPQA stays omitted:** only conflicting third-party
  numbers circulate (67.2 / 64.6 / 67) and no exact leaderboard value could
  be verified.
- Still no published numbers found for: GPT-5.6 Terra/Luna GPQA and
  SWE-bench Verified, Gemini 3.5 Flash GPQA/SWE-bench Verified, Terminal-Bench
  2.1 runs for DeepSeek V4 Pro / Qwen 3.6 / GLM-5.2 / Grok 4.1 Fast.

Dataset conventions decided at this refresh:

- **MMLU was dropped.** Only 3 of 16 models had a reliably sourced plain-MMLU
  score (no 2026 flagship launch publishes it), below our 4-model floor for
  keeping a column.
- **Terminal-Bench numbers are 2.1 only.** Published 2.0/1.0 results (Haiku
  4.5, Gemini 3.1 Pro from Google, Qwen 3.6) are excluded, not converted.
- **"Qwen 3.6" means Qwen3.6-35B-A3B**, the flagship open-weights release
  (not the closed "Plus"/Max-Preview variants).
- **DeepSeek V4 Pro figures are the tech report's "Think Max" mode.**
- GPT-5.6 GPQA numbers circulating (94.6/92.9/92.3) are disputed (Vellum and
  MarkTechPost report OpenAI published none), so they are omitted.

Sources used (2026-07-14 second pass): tbench.ai (Terminal-Bench 2.1
leaderboard, full 17-row fetch), anthropic.com/news + Vellum/emergent.sh
launch coverage (Sonnet 5 80.4 and Opus 4.8 74.6 provenance check),
artificialanalysis.ai + benchlm.ai (Terra/Luna GPQA and Sol SWE-bench
Verified rechecks), techtimes.com + marketscale.com (Gemini 3.5 Pro GA
status), web search for July 14 release news.

Sources used (2026-07-14 morning): tbench.ai (Terminal-Bench 2.1 leaderboard,
fetched twice for consistency), benchlm.ai (Haiku 4.5 model page),
o-mega.ai (GPT-5.6 benchmark article; CAISI attribution check),
web search for July 13-14 release news and Gemini 3.5 Pro GA status.

Sources used (2026-07-13 second pass): marktechpost.com and
digitalapplied.com (Muse Spark 1.1 launch coverage: pricing, context, model
id, Meta's published eval table), vals.ai and benchlm.ai (Muse Spark 1.1
model pages: max output, GPQA Diamond via Artificial Analysis, Terminal-Bench
2.0-only status), deeplearning.ai + Wikipedia Llama article (Muse Spark
replaced Llama; closed-weights pivot), tbench.ai (2.1 leaderboard recheck),
llm-stats.com (news recheck for July 8-13 releases).

Sources used (2026-07-13 morning refresh): artificialanalysis.ai (GPQA Diamond and
Terminal-Bench v2.1 leaderboards, Grok 4.5 model page), benchlm.ai (Grok 4.5
and Claude Sonnet 5 model pages), openrouter.ai + requesty.ai +
cloudprice.net (Grok 4.5 pricing/specs/model id), roo.beehiiv.com and
kingy.ai (xAI's self-reported Grok 4.5 eval table), anthropic.com/news
(Haiku 4.5 recheck), tbench.ai (Terminal-Bench 2.1 leaderboard recheck).

Sources used (2026-07-11 score refresh):

- Provider/official: anthropic.com/news (Fable 5 & Mythos 5, Haiku 4.5),
  Claude Sonnet 5 System Card, blog.google (Gemini 3.5), Meta Llama 4 model
  card on Hugging Face, DeepSeek V4 technical report (arXiv:2606.19348),
  nist.gov (CAISI evaluation of DeepSeek V4 Pro).
- Leaderboards: tbench.ai (official Terminal-Bench 2.1), vals.ai,
  llm-stats.com, benchlm.ai, artificialanalysis.ai, labs.scale.com
  (SWE-bench Pro public subset).
- Secondary coverage quoting provider eval tables: vellum.ai,
  marktechpost.com, smartchunks.com, digitalapplied.com, emergent.sh,
  macaron.im, labellerr.com, the-decoder.com, theairankings.com,
  designforonline.com.

Earlier pass (2026-07-09, prices/context): Anthropic model docs;
aipricing.guru / digitalapplied.com (GPT-5.6); ai.google.dev + tldl.io
(Gemini); docs.x.ai + requesty.ai (Grok); morphllm.com, techsy.io
(open-source lineup).
