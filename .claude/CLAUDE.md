# Models.fyi

An educational website that simplifies AI model selection for non-experts. Tracks flagship models from OpenAI, Anthropic, Google, xAI, and others, compares them across benchmarks, and guides users to the right model for their task via interactive graphs and decision flows.

See `README.md` for the full product vision and requirements.

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

## Conventions

- SEO is a first-class requirement: semantic HTML, meta tags, and accessible markup on every page.
- Keep the stack light. The README explicitly avoids heavy frameworks — prefer simple, composable components.
- Model and benchmark data are hardcoded for now. Isolate data behind a typed module so migrating to a database later is a contained change.

## Deployment

- Always push finished work to `main` — every push to main triggers the GitHub Actions deploy to GitHub Pages. Don't leave completed work sitting on feature branches.
- Watch the deploy with a background Monitor, not by polling or `gh run watch` in the foreground — it wastes context.
- After the deploy succeeds, verify the change on the live site, then close the GitHub issue.
