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

1. Re-research each provider's current lineup, pricing, and context windows
   (provider docs first, then leaderboards such as vals.ai, llm-stats.com,
   artificialanalysis.ai for scores).
2. Update `models.ts` / `benchmarks.ts` / `providers.ts`.
3. Bump `dataSourcedAt` in `index.ts`.
4. Run `npm run validate` (schema + sanity checks; also runs in CI).

Last refreshed: **2026-07-13** (Grok 4.5 lineup swap + GPQA backfill; prices
and context windows otherwise from the 2026-07-09 pass). Provider-published
evals win over third-party harness runs; where a number is third-party or
contested, `models.ts` carries an inline comment saying so.

2026-07-13 refresh notes:

- **Grok 4.5 replaced Grok 4.3** as xAI's flagship (launched 2026-07-08,
  `grok-4.5`, $2/$6, 500K context — long-context requests above 200K bill
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

Sources used (2026-07-13 refresh): artificialanalysis.ai (GPQA Diamond and
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
