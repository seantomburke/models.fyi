# Models.wtf

An educational website that simplifies AI model selection for non-experts. Tracks flagship models from OpenAI, Anthropic, Google, xAI, and others, compares them across benchmarks, and guides users to the right model for their task via interactive graphs and decision flows.

See `docs/initial-plan.md` for the full product vision and requirements.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Static/hardcoded data initially (a database comes later)
- Graphs via [openchart](https://github.com/tryopendata/openchart)
- Deployed to GitHub Pages

## Quick Commands

```bash
npm run dev       # Start the dev server
npm run build     # Production build
npm run preview   # Preview the production build
npm test          # Run tests (vitest)
npm run lint      # Lint
```

## Prerequisites

- Node.js and npm

## Agent Setup

This repo is agent-agnostic. Guidance lives in `AGENTS.md` files, never in any one agent's config format:

- This file holds repo-wide guidance. Nested `AGENTS.md` files add area rules: `src/AGENTS.md` (frontend), `src/data/AGENTS.md` (data refresh), `src/lib/AGENTS.md` (routeMeta, search, URL state), `src/pages/learn/AGENTS.md` (Learn content), `scripts/AGENTS.md` (build pipeline). Read the nearest one for the files you touch.
- Cross-cutting rules live in `.agents/rules/`. Read the matching rule before working in its area (table below).
- Reusable skills live in `.agents/skills/<name>/SKILL.md`. When a task matches a skill listed below, read its `SKILL.md` and follow it. Skills are the vendor-agnostic home for reusable roles and workflows, so prefer a skill over any one agent's config format.
- Agent-specific discovery, permissions, and plugin config stays in that agent's folder. Don't put project guidance there.
- Describe required capabilities (read, edit, search, run, monitor) instead of naming vendor-specific tools in shared guidance.
- Run `npm run check:agents` after changing agent guidance, skills, rules, or adapters.

## Memory

The repo IS the persistent memory for every agent. When you learn a durable, non-obvious fact (a gotcha, an invariant, a dead end), write it into the nearest nested `AGENTS.md` or the matching `.agents/rules/` file. Follow `.agents/rules/memory.md` for the conventions. Never park project knowledge in agent-private storage.

## Rules

| Rule | Read when |
|------|-----------|
| `.agents/rules/writing-style.md` | Writing or editing ANY user-facing copy, titles, or prose |
| `.agents/rules/performance-budget.md` | Adding imports, routes, or heavy components |
| `.agents/rules/prerender-seo.md` | Touching meta tags, prerender, OG images, sitemap, or head content |
| `.agents/rules/frontend-gotchas.md` | Styling, accessibility, charts, or interaction work |
| `.agents/rules/workflow.md` | Committing, deploying, or auditing |
| `.agents/rules/memory.md` | Recording a learned fact for future agents |

## Skills

| Skill | Use when |
|-------|----------|
| `.agents/skills/writing-tests/` | Writing tests, choosing test types |
| `.agents/skills/fixing-flaky-tests/` | Tests pass alone but fail in the suite, or fail intermittently |
| `.agents/skills/handling-errors/` | Designing try/catch, error propagation, Result patterns |
| `.agents/skills/systematic-debugging/` | Investigating bugs, errors, unexpected behavior |
| `.agents/skills/design/` | Building data-heavy or dashboard-style UI |
| `.agents/skills/refreshing-model-data/` | Refreshing model/benchmark data, adding new model releases |
| `.agents/skills/copywriter/` | Writing or editing any user-facing copy, or reviewing copy for style |

## Copy

Any task that writes or edits user-facing copy MUST follow the copywriter skill (`.agents/skills/copywriter/SKILL.md`) and `.agents/rules/writing-style.md`. Highlights: patient-teacher ELI5 voice, no em dashes anywhere in the repo, no "X, not Y" contrast framing, prefer visuals and animations over paragraphs, math through the KaTeX `MathBlock` component. `src/lib/copy-style.test.ts` enforces the bans.

## Debugging

When investigating bugs or unexpected behavior, follow `.agents/skills/systematic-debugging/SKILL.md`.

Four-phase approach:
1. Reproduce the issue
2. Trace the code path
3. Identify root cause
4. Verify the fix

## Conventions

- SEO is a first-class requirement: semantic HTML, meta tags, and accessible markup on every page.
- Keep the stack light. The initial plan (`docs/initial-plan.md`) explicitly avoids heavy frameworks; prefer simple, composable components.
- Model and benchmark data are hardcoded for now. Isolate data behind a typed module so migrating to a database later is a contained change.
- Style: oxlint, single quotes, no semicolons. No prettier in this repo.

## Deployment

Follow `.agents/rules/workflow.md`. Short version: run the preflight checks, push finished work to `main` (that triggers the GitHub Pages deploy), monitor the deploy in the background, verify on the live site, close the issue.
