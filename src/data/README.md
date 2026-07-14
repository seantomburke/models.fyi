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

Last refreshed: **2026-07-14, second pass** (Terminal-Bench 2.1 independent
runs annotated for Opus 4.8 and Sonnet 5; prices and context windows from
the 2026-07-09 pass). Provider-published evals win over third-party harness
runs; where a number is third-party or contested, `models.ts` carries an
inline comment saying so.

2026-07-14 second-pass refresh notes:

- **Annotated Anthropic Terminal-Bench numbers with tbench.ai Claude Code
  runs.** Opus 4.8's published 74.6 (Terminus 2, per its system card) has an
  independent Claude Code run at 78.9; Sonnet 5's published 80.4 has a
  Claude Code run at 74.6. Scores unchanged per the provider-wins
  convention; inline comments added. (We also verified the published
  numbers against launch coverage — the 80.4/74.6 pair looked like a
  possible row-misalignment from the leaderboard, but both are genuinely
  Anthropic-published: Sonnet 5 announcement and Opus 4.8 system card
  §8.3.)
- **Rejected leads:** an llm-stats.com search snippet claimed "Gemini 3.2
  Pro", "DeepSeek V4.5", and "Llama 5" joined the July leaderboards — all
  three are phantom names (no such releases exist; Llama 5 was already
  debunked 7/13 as a misnaming of Muse Spark 1.1). A Lushbinary post cites
  "GPT-5.6 Sol Ultra 91.9" on Terminal-Bench 2.1 — that is a max-effort
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
  were watching.** Muse Spark 1.1 gained a score (76.2, mini-SWE-agent) —
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
  docs, or pricing — reporting now points at July 17); no new flagship
  releases July 13–14; no 2.1 runs yet for DeepSeek V4 Pro / Qwen 3.6 /
  GLM-5.2 / Grok 4.1 Fast.

2026-07-13 second-pass refresh notes:

- **Muse Spark 1.1 added as Meta's flagship** (released 2026-07-09 by Meta
  Superintelligence Labs, `muse-spark-1.1`, $1.25/$4.25, 1M context, 256K max
  output, reasoning with adjustable effort). It is closed-weights on the new
  Meta Model API — Meta's pivot away from open-weights Llama — so the `meta`
  provider is now `openSource: false` while the Llama 4 models keep their
  model-level open flags (they remain Meta's newest open weights). SWE-bench
  Pro 61.5 is Meta-published; GPQA Diamond 88.4 is an Artificial Analysis
  independent run; Terminal-Bench is omitted because Meta published only a
  2.0 run (80.0) and we track 2.1 only. Meta published no SWE-bench Verified.
  Note: several outlets covered this release as "Llama 5" — that name is
  wrong; Wikipedia and deeplearning.ai confirm the Llama line ended at 4.
- Meta was also added to the quiz's company-preference options now that it
  sells API access like the other closed providers.
- Checked and unchanged: no new tbench.ai Terminal-Bench 2.1 entries for our
  models beyond what the morning pass recorded (Grok 4.5 and GPT-5.6 still
  absent from the official leaderboard); GPT-5.6 Terra/Luna GPQA still
  unpublished (Artificial Analysis shows only composite index scores);
  Gemini 3.5 Pro is still unreleased (third-party reports point at July 17
  with no official Google model card, docs, or pricing — excluded until GA).

2026-07-13 morning refresh notes:

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

Sources used (2026-07-14 second pass): tbench.ai (Terminal-Bench 2.1
leaderboard, full 17-row fetch), anthropic.com/news + Vellum/emergent.sh
launch coverage (Sonnet 5 80.4 and Opus 4.8 74.6 provenance check),
artificialanalysis.ai + benchlm.ai (Terra/Luna GPQA and Sol SWE-bench
Verified rechecks), techtimes.com + marketscale.com (Gemini 3.5 Pro GA
status), web search for July 14 release news.

Sources used (2026-07-14 morning): tbench.ai (Terminal-Bench 2.1 leaderboard,
fetched twice for consistency), benchlm.ai (Haiku 4.5 model page),
o-mega.ai (GPT-5.6 benchmark article — CAISI attribution check),
web search for July 13–14 release news and Gemini 3.5 Pro GA status.

Sources used (2026-07-13 second pass): marktechpost.com and
digitalapplied.com (Muse Spark 1.1 launch coverage: pricing, context, model
id, Meta's published eval table), vals.ai and benchlm.ai (Muse Spark 1.1
model pages: max output, GPQA Diamond via Artificial Analysis, Terminal-Bench
2.0-only status), deeplearning.ai + Wikipedia Llama article (Muse Spark
replaced Llama; closed-weights pivot), tbench.ai (2.1 leaderboard recheck),
llm-stats.com (news recheck for July 8–13 releases).

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
