# Workflow

## Before committing

Run all of these and fix failures before claiming completion:

```bash
npm run check:agents   # Agent config consistency
npx tsc --noEmit       # Types
npm test               # Vitest suite (includes prose and copy-style guards)
npm run build          # Prerender guard, bundle budget, OG drift, link check
```

- No prettier in this repo. oxlint only, single quotes, no semicolons. Never run prettier here.
- New page state goes through a `*UrlState.ts` module with `replace: true` (see `compareUrlState.ts`, `searchUrlState.ts`).

## Auditing

- Fetch, rebase, `npm install`, and clean rebuild before auditing anything. `dist/` is gitignored and lies about the current tree.

## Deployment

- Commit straight to `main` during the prelaunch phase (in effect as of 2026-07-23). No feature branches, no PRs, unless Sean says otherwise. This overrides any default branch-first habit.
- Prelaunch is toggled by the presence of the `.agents/prelaunch` marker file. `scripts/guard-prelaunch-branch.mjs` reads it and warns (warn-only, never blocks) on any `git commit` or `git push` from a branch other than `main` while the marker exists. It is wired as a Claude Code PreToolUse Bash hook in `.claude/settings.json`, and any agent, git hook, or CI step can call the same script. Delete `.agents/prelaunch` at launch to end this workflow.
- Push to `main` immediately after committing during prelaunch; do not wait to be asked. Every push to main triggers the GitHub Actions deploy to GitHub Pages, and that deploy is the point. Do not leave completed work unpushed or on feature branches.
- Monitor the deploy asynchronously with a background job capability; do not poll in the foreground.
- The live site is `https://seantomburke.github.io/models.wtf` (a GitHub Pages subpath, no custom domain).
- After deploy succeeds, verify the change on the live site, then close the GitHub issue.

## Repo hygiene

- Session reports, audits, and plans never land in the repo root. Put them in `docs/archive/` if they must be kept at all.
- Parallel workers sharing a worktree cross-commit each other's files. Verify `git commit --stat` against what each worker reports done.
- For repo-wide mechanical sweeps (like the 2026-07-23 dash removal), split workers by disjoint path sets (one owns `src/components`, another owns `src/lib` + `src/pages`), have each run tsc and the full test suite before reporting, and keep committing in one lane. This kept a 90-file sweep conflict-free.
