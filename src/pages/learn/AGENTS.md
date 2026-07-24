# Learn Guidance (src/pages/learn/)

Extends the root `AGENTS.md` and `src/AGENTS.md`. The Learn section teaches AI concepts to normal people. Follow `.agents/rules/writing-style.md` for every word of copy.

## Content rules

- Prefer interactive visuals, diagrams, and animations over paragraph blocks. Three consecutive paragraphs without a visual is a smell; build a component instead. The 2026-07-23 visuals audit filed issues #110-#124 (label `learn-visuals`) for the topics that violate this; work them down before adding more prose-only topics.
- Math renders through `MathBlock` (`src/components/MathBlock.tsx`) with LaTeX. No unicode-art equations in prose strings. Reference implementation: `WeightedSumEquation` registered in `sectionComponents.ts` for the weights topic.
- Section headings are shared keys: `topicProse.ts` and `sectionComponents.ts` both key on `<slug>::<heading>` from `topics.ts`. Renaming a heading means updating all keyed files in the same change or the prose and demo silently vanish (a Learn.test guard catches missing prose).
- Long prose lives in `topicProse.ts`, which loads lazily. Never import it top-level into `topics.ts`; that ships it on every route (see `.agents/rules/performance-budget.md`).

## Lab models

- The lab lineup (Doodle-64/525/918, Parrot-43, Parrot-2D) is named in the hardcoded lab level blurb in `topics.ts`. Adding a lab model means updating that blurb.
- Changing Parrot-43's training corpus means renaming it (the 43 counts its word pairs). Parrot-2D is named for its two readable embedding dimensions, not a parameter count, so its corpus can grow (it does, four words to six, inside the demo).
- `embeddingModel.ts` is the advanced embedding-search demo (the meaning-space map for `embedding-models`). The Parrot-2D next-word model lives in `sceneModel.ts` + `SceneNextWord.tsx`. Do not conflate the two.

## Adding a topic

- New topics need the sitemap rebuilt (and copied to `public/`) plus prerender coverage. `routeMeta.ts` drives both.
- Give the topic card a motif animation (`topicMotifs.ts` + `TopicCardAnimation.tsx`) and respect `prefers-reduced-motion`.
- Heavy interactive components gate their chunks on IntersectionObserver visibility with an always-load fallback.
