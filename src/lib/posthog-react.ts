/**
 * Single re-export of the PostHog React bindings.
 *
 * Import `usePostHog` / `PostHogProvider` from here, never from
 * `@posthog/react` directly — that package's main entry does a top-level
 * `import posthogJs from 'posthog-js'`, which pulls the entire analytics SDK
 * into the entry chunk and undoes the deferred loading in lib/analytics.ts.
 * The `slim` build has the same hooks with no such import.
 *
 * The path is spelled all the way out because `@posthog/react` ships no
 * `exports` map, so `@posthog/react/slim` is a bare directory import: Vite
 * resolves it, but the prerender step (scripts/prerender.mjs) runs the SSR
 * bundle in plain Node ESM, which rejects directory imports with
 * ERR_UNSUPPORTED_DIR_IMPORT. Pointing at the file works in both.
 */
export { usePostHog, PostHogProvider } from '@posthog/react/dist/esm/slim/index.js'
