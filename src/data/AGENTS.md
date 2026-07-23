# Data Guidance (src/data/)

Extends the root `AGENTS.md`. Data refreshes go through `.agents/skills/refreshing-model-data/SKILL.md` (workflow, source registry, self-improvement rules). Read `README.md` in this directory for sourcing rules and the dated refresh history. Never write benchmark or model facts from memory; missing beats fabricated.

## Refresh gotchas

- The HLE column is closed-book. Labs publish both with-tools and closed-book scores (GLM 54.7 vs 40.5, DeepSeek 48.2 vs 37.7). Check the model card, never a blog headline.
- `benchmarks.ts` holds only benchmarks that have at least one score.
- The empty benchmark cells are unpublished at the source. The dead ends are listed in `README.md`. Do not re-sweep them without a new provider release.
- Every new model needs a What's New entry in `releases.ts`, and per-score entries in `scoreProvenance` (provider vs independent sourcing).
- Capability flags (vision, imageGeneration, ...) must be set on at least one real model; a guard test asserts every filter matches something.

## Downstream effects of data changes

- Quiz `avgScore` uses deltas against each benchmark's field average. After any data change, diff the full quiz pick matrix; a raw mean once let a one-score model outrank a four-score model.
- Glossary and FAQ prose reference current model names. `prose-freshness.test.ts` guards against retired generations; keep prose examples aligned with `models.ts`.
- Provider entries require a `blurb` (used by `/providers/:id` pages).
