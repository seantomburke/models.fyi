# models.wtf

Pick the right AI model without needing a PhD in benchmarks.

**Live site:** [seantomburke.github.io/models.wtf](https://seantomburke.github.io/models.wtf/)

models.wtf tracks the flagship models from OpenAI, Anthropic, Google, xAI, Meta, and others, and explains them in plain language. Compare benchmarks side by side, estimate what a workload costs, or start from "what is a token?" and work up from there. Everything is written for the person who has heard of ChatGPT but has no idea what a context window is.

## What's on the site

| Page | What it does |
|------|--------------|
| Home | Comparison table of current flagship models: pricing, context, benchmarks |
| Model pages | Deep dive per model with specs, benchmark scores, and score sources |
| Compare | Side-by-side comparison, shareable via URL |
| Graph | Plot models on any two axes (cost vs. benchmark score, etc.) |
| Calculator | Token cost estimator across models |
| Quiz | "Which model should I use?" decision flow |
| Learn | Leveled learning path, from tokens to neural networks, with interactive demos |
| Glossary | 40 AI terms explained like you're five |
| What's New | Model launches and release history |

The Learn section includes hands-on toys: a real o200k_base tokenizer, a trainable pixel classifier, and a two-layer digit recognizer you can draw into.

## Stack

- Vite + React + TypeScript, Tailwind CSS v4
- Static data in `src/data/` (no database, by design)
- Prerendered routes for SEO, deployed to GitHub Pages
- Vitest for tests, oxlint for linting

## Development

```bash
npm install
npm run dev       # dev server
npm test          # vitest
npm run lint      # oxlint
npm run build     # tsc + vite build + prerender + sitemap
npm run preview   # serve the production build
```

Data lives in `src/data/` (models, benchmarks, releases). If you add a model, add its benchmark scores, score provenance, and a What's New entry together. CI validates the release data.

## Docs

- [docs/initial-plan.md](docs/initial-plan.md): the original product vision and requirements this repo was built from
- [AGENTS.md](AGENTS.md): conventions and setup for coding agents working in this repo
