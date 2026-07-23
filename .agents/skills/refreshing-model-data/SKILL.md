---
name: refreshing-model-data
description: Refresh models.fyi model and benchmark data. Discovers newly released models from news (public availability optional), pulls benchmark scores from trusted sources, updates the data layer end to end, and improves its own source registry every run.
---

# Refreshing Model Data

This skill is the canonical workflow for updating `src/data/`. It covers discovering new model releases, sourcing benchmark scores, writing the data files, and keeping this skill's own source registry alive. Read `src/data/AGENTS.md` and `src/data/README.md` before starting; the README's dated refresh notes list every dead end already explored, so you never re-sweep them without a new provider release.

## Hard rules (non-negotiable)

- **Never write facts from memory.** Every price, context window, score, and release date must come from a source checked during this run. Model training data is not a source.
- **Missing beats fabricated.** No reliable published score means omit the key from `scores`. The UI renders a dash placeholder for missing cells. An empty cell is a correct answer; a plausible guess is data corruption.
- **HLE is closed-book.** Labs publish both with-tools and closed-book scores (GLM 54.7 vs 40.5, DeepSeek 48.2 vs 37.7). Aggregators quote the tool-assisted headline. Check the model card itself, never a blog headline.
- **Provider wins for displayed scores.** When a provider publishes a number and an independent runner diverges, display the provider number and record the independent run in `scoreProvenance` (`independentScore` + `independentRunner`). Independent-only numbers get `source: 'independent'` with a `runner` and, when available, a direct `sourceUrl` to the result page.
- **Terminal-Bench is 2.1 only.** Results that do not name version 2.1 are excluded, never converted.
- **Exact variant matching.** A score belongs to the exact model, variant, and reasoning-effort configuration in `models.ts`. A non-reasoning run cannot fill a reasoning model's cell. A subset or different-harness run is a different number, not an update.
- **List prices only.** Ignore short-term intro discounts. Open-weights models have `null` prices.

## Workflow

### 1. Discover new releases

Search recent AI news for model releases since `dataSourcedAt` (in `src/data/index.ts`). Include models that are announced or API-only even when not yet publicly available; per issue #108 the front page covers releases regardless of public availability. Check:

- Provider newsrooms and blogs directly (see registry below).
- The release feeds on llm-stats.com and benchmarklist.com.
- General news search for "<provider> new model", "flagship model release", and specific rumored names.

Beware phantom names: search digests have invented "Gemini 3.2 Pro", "DeepSeek V4.5", and "Llama 5" (a misnaming of Muse Spark 1.1). Confirm every release on the provider's own site before adding it.

### 2. Source scores and specs

For each new or changed model, pull specs (pricing, context window, max output, modalities, release date) from provider docs first, then benchmark scores from the registry sources. Record for every number: the URL, the date checked, whether it is provider-published or independent, and the exact configuration (harness, effort, closed-book vs tools).

### 3. Update the data files

Work through these in order; `src/data/types.ts` is the schema reference.

1. **`providers.ts`**: add any new provider. Every provider entry requires a `blurb` (used by `/providers/:id` pages).
2. **`benchmarks.ts`**: add a benchmark only when at least one model has a score for it. Keep the ELI5 description in the site voice (`.agents/rules/writing-style.md`).
3. **`models.ts`**: add or update models. Set `releaseDate` (ISO date) when reliably known. Fill `scores` only from this run's sources. Add `scoreProvenance` entries for every independent score and every provider score with a known diverging independent run. Set capability flags (`vision`, `imageGeneration`, `reasoning`) from first-party modality tables; explicit `false` needs a provider card that positively establishes the absence. Every capability filter must match at least one real model (a guard test enforces this).
4. **`releases.ts`**: every new model needs a What's New entry (`type: 'new'`, with `modelId`, a dated entry, and a `link` to the announcement when one exists). Notable price changes and feature updates get entries too. Copy here is user-facing: follow the copywriter role and writing-style rule.
5. **`index.ts`**: bump `dataSourcedAt` to today.

### 4. Record the pass

Append a dated refresh-notes block to `src/data/README.md` in the established format: what changed, what was rejected and why, what was checked and unchanged, and the sources used with dates. Rejected leads matter as much as accepted ones; they are what stops the next run from re-chasing dead ends.

### 5. Check downstream effects

- Diff the full quiz pick matrix after any score change (`src/lib/quiz.ts` derives from the canonical `models` array; verify no duplicated data appeared).
- Glossary and FAQ prose reference current model names; `prose-freshness.test.ts` guards retired generations.

### 6. Validate

```bash
npm run validate   # schema + sanity checks
npm test           # guard tests: capability filters, prose freshness, copy style
npx tsc --noEmit
```

Fix failures before reporting the refresh complete.

### 7. Self-improvement (mandatory, every run)

This step maintains the source registry below. A refresh that skips it is incomplete.

1. **Record verification.** Update the Last verified date for every registry source you actually used this run.
2. **Demote decay.** If a source 404s, stops updating, changes its methodology, or starts contradicting provider primaries, move it to the Demoted table with the date and reason. Do not silently keep citing it.
3. **Scout at least one candidate.** Search for at least one new benchmark or model-news source not in the registry (new leaderboards, new eval suites, provider status pages). Evaluate it before trusting: does it name its harness and configuration? Does it link primary sources? Do its numbers for models we already track match our verified values? Record the verdict in the Candidates table even when the verdict is rejection.
4. **Edit this file.** Promotions, demotions, and date bumps happen in this SKILL.md in the same commit as the data refresh. The registry lives here precisely so it cannot rot separately from the workflow.

## Source registry

Trust order within a tier is top to bottom. Provider primaries always beat aggregators.

### Tier 1: provider primaries (specs, pricing, provider-published scores)

| Source | What for | Last verified | Reliability note |
|---|---|---|---|
| anthropic.com/news + model docs | Claude releases, eval tables, system cards | 2026-07-23 | System cards carry the authoritative numbers; announcement pages can lag. |
| openai.com/index + platform docs | GPT releases, eval tables, pricing | 2026-07-23 | openai.com intermittently returns HTTP 403 to automated fetches; retry or use a browser tool. |
| blog.google + deepmind.google + ai.google.dev | Gemini releases, model cards, API pricing | 2026-07-23 | Model cards distinguish "No tools" HLE from tool-assisted; read the exact column. |
| docs.x.ai + x.ai news | Grok releases, pricing, model table | 2026-07-23 | Retired models vanish from the docs table entirely; their slugs redirect to newer models. |
| meta llama-models MODEL_CARD.md + Meta AI blog | Llama and Muse releases | 2026-07-23 | Muse Spark is closed-weights on the Meta Model API; Llama cards top out below the tracked benchmarks. |
| docs.z.ai, api-docs.deepseek.com + tech reports, moonshot.ai, qwen docs, thinkingmachines.ai | Open-model and challenger releases | 2026-07-23 | Tech reports (arXiv) carry the closed-book numbers aggregators misquote. |

### Tier 2: trusted independent leaderboards (scores, cross-checks)

| Source | What for | Last verified | Reliability note |
|---|---|---|---|
| artificialanalysis.ai | Intelligence Index, HLE, GPQA independent runs | 2026-07-23 | Names exact model + effort config; labels estimates as estimates (estimates are not publishable here). |
| vals.ai | SWE-bench Verified, Terminal-Bench 2.1 uniform runs | 2026-07-23 | Uniform-harness runs (mini-swe-agent, Terminus 2) make cross-model comparison honest. Index subsets are different harnesses. |
| tbench.ai | Official Terminal-Bench 2.1 leaderboard | 2026-07-23 | Small roster; absence of a model means no run yet, never a zero. |
| llm-stats.com | Release feed, spec cross-check | 2026-07-23 | Good release radar; its search snippets have surfaced phantom model names, so confirm on provider sites. |
| benchmarklist.com | Per-model benchmark result pages with links | 2026-07-22 | Links score-level sources; useful for provenance URLs. |
| labs.scale.com | SWE-bench Pro public subset, Scale HLE leaderboard | 2026-07-20 | Scale's HLE set is multimodal, a different protocol from the closed-book column here. |

### Tier 3: secondary coverage (leads only, never sole source)

benchlm.ai, openrouter.ai, vellum.ai, marktechpost.com, and similar outlets quoting provider eval tables. Use them to find leads and cross-check, then land every number on a Tier 1 or Tier 2 source. Last swept 2026-07-23.

### Demoted sources

| Source | Demoted | Reason |
|---|---|---|
| (none yet) | | |

### Candidates evaluated

| Candidate | Date | Verdict |
|---|---|---|
| (seed the first entry on the next run) | | |

## Reporting

Summarize the pass the way the README notes do: cells filled, cells deliberately left empty and why, corrections, rejected leads, registry changes. Then follow `.agents/rules/workflow.md` for committing and deploying.
