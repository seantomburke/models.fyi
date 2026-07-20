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

Last refreshed: **2026-07-20, second pass** (HLE backfilled for five models;
Gemini 3.5 Flash provenance corrected). Provider-published evals win over
third-party harness runs; where a number is third-party or contested,
`models.ts` carries an inline comment saying so.

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
  at all — the number is an Artificial Analysis run, now marked independent.
  The same card confirms its Terminal-Bench 76.2 *is* a 2.1 result
  (Terminus-2 harness), contradicting secondary coverage that called it 2.0,
  so the score stands and the convention is not violated.
- **Terminal-Bench divergences recorded** from the July 16 Vals AI Terminus 2
  run for Gemini 3.5 Flash (74.16), GLM-5.2 (67.79), DeepSeek V4 Pro (50.19),
  and Inkling (47.57). Provider numbers stay per the convention.
- **Rejected leads:** Gemini 3.1 Pro's HLE is quoted as both 44.4 and 51.4 by
  different sources with no provider figure to settle it, so it stays
  omitted. Grok 4.5 has no isolated HLE score — only its position in
  Artificial Analysis's composite index — so it stays omitted too. Kimi K3's
  "95.10 SWE-bench Verified" is the Vals *Index subset*, a different harness
  from the 93.4 mini-swe-agent run already recorded, not an update to it.
- Checked and unchanged: no new frontier releases July 17–20 (llm-stats
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
  all Moonshot-published — no independent runs yet (K3 is absent from
  tbench.ai's 17-row leaderboard). Moonshot publishes no SWE-bench
  Verified/Pro (its launch table uses DeepSWE/ProgramBench/FrontierSWE
  instead). Open weights are promised by 2026-07-27 — flip `openSource`
  and null the prices if that lands.
- **Inkling added as Thinking Machines' first model** (released 2026-07-15:
  975B MoE / 41B active, Apache 2.0 open weights on Hugging Face, up to 1M
  context, multimodal text/image/audio). All scores are from TML's launch
  eval table (effort=0.99): SWE-bench Verified 77.6, SWE-bench Pro public
  54.3, GPQA Diamond 87.2, Terminal-Bench 2.1 63.8, HLE 46.0 (with tools).
  Prices are null per the open-weights convention (hosted APIs exist on
  Together/Fireworks/Modal/Databricks/Baseten at varying rates).
- **Gemini 3.5 Pro did NOT ship on July 17.** Bloomberg and 9to5Google
  (July 16) report the launch slipped again — the third missed deadline —
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
(Haiku 4.5 GPQA recheck), llm-stats.com (July 14–19 release news).

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
