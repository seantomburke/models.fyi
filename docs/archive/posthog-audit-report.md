# PostHog Audit Report

## Summary

The browser-only React/Vite integration is healthy after remediation: initialization is deferred but queues early events, the stable provider client now forwards post-load captures to the real SDK, initialization runs once, and configuration comes from environment variables. The audit found no remaining correctness errors; the only data-collection risk is that browser events go directly to PostHog rather than through a first-party proxy, while the installed SDK is one patch release behind.

**Counts**

- **Errors**: 0 (must fix)
- **Warnings**: 1 (should fix)
- **Suggestions**: 1 (nice to have)
- **Passes**: 10

**Problematic items**

| Severity | Area | Check | File | Details |
|----------|------|-------|------|---------|
| `warning` | Event Capture | Reverse proxy | `.env.production:2` | `VITE_POSTHOG_HOST` points directly to `https://us.i.posthog.com`, so blockers can discard browser captures. |
| `suggestion` | Installation | SDK up to date | `package.json:22` | `posthog-js` 1.404.0 is installed; 1.404.1 is current. |

## Recommended actions

1. **Event Capture · Reverse proxy** — Browser captures use PostHog's public ingest host. _Why it matters:_ Tracking blockers can undercount visits, funnels, and activation events. _Fix:_ Provision a first-party ingest proxy and update `VITE_POSTHOG_HOST` at `.env.production:2`; static GitHub Pages hosting means this requires external infrastructure. See [PostHog proxy docs](https://posthog.com/docs/advanced/proxy).
2. **Installation · SDK up to date** — The JavaScript SDK is one patch release behind. _Why it matters:_ Patch releases carry low-risk fixes, though no current data-quality defect was found. _Fix:_ Update `posthog-js` at `package.json:22` after validating the slim-build import remains compatible. See [PostHog JavaScript SDK docs](https://posthog.com/docs/libraries/js).

## Full audit

### Installation

These checks verify that the project has a supported PostHog SDK, keeps it current, and initializes it once in the correct runtime with environment-provided configuration.

| Check | Status | File | Details |
|-------|--------|------|---------|
| SDK installed | pass | `package.json:22` | `posthog-js` 1.404.0 is installed for the React/Vite browser application. |
| SDK up to date | suggestion | `package.json:22` | Installed 1.404.0; latest published version is 1.404.1. |
| Initialization correct | pass | `src/lib/analytics.ts:81` | Browser-only initialization uses `VITE_POSTHOG_PROJECT_TOKEN`; early events are queued and replayed. |
| Initialization not duplicated | pass | `src/lib/analytics.ts:92` | Exactly one browser initialization site exists; the SSR entry does not initialize PostHog. |
| Deferred provider capture | pass | `src/lib/analytics.ts:45` | The stable provider client queues before initialization and delegates to the real SDK afterward, preventing post-load event loss. |

#### Assumptions and blind spots

Static inspection cannot prove the production environment injects the same values as `.env.production` or that blockers do not prevent the deferred chunk from loading. Live event volume and browser request behavior should be checked in PostHog and the deployed site.

### Identification

These checks verify that authenticated identities are stable, timely, coordinated across runtimes, and reset during account changes.

| Check | Status | File | Details |
|-------|--------|------|---------|
| Stable distinct ID | pass | `src/lib/analytics.ts:22` | Not applicable: the site is anonymous and has no `identify` call. |
| Identify before captures | pass | `src/lib/analytics.ts:56` | Not applicable: anonymous captures are queued until initialization and require no authenticated identity. |
| Cross-runtime distinct ID | pass | `src/entry-server.tsx:1` | Single runtime: only the browser initializes PostHog. |
| Reset on logout | pass | `docs/initial-plan.md:56` | Not applicable: no authentication, logout, or account switching exists. |

#### Assumptions and blind spots

No authentication or server-side capture path exists today. If either is added, this area must be re-audited before identified events ship.

### Event Capture

These checks verify bounded event naming, reliable delivery, and explicit measurement of the product's meaningful activation outcomes.

| Check | Status | File | Details |
|-------|--------|------|---------|
| Static event names | pass | `src/lib/posthog-events.ts:8` | Captures use literals, fixed constants, or finite literal maps; runtime values are properties. |
| Reverse proxy | warning | `.env.production:2` | The browser posts directly to `https://us.i.posthog.com`; no first-party proxy is configured. |
| Growth events | pass | `src/lib/posthog-events.ts:29` | Quiz completion, bookmark actions, and successful exports are explicit; the site has no auth, billing, or subscription flows. |

#### Assumptions and blind spots

Static inspection confirms capture intent but not ingestion success, event volume, or whether the chosen activation events correlate with user value. Live schema and behavioral queries are required to validate those assumptions.

## Remediation history

- Finite interaction helpers use explicit typed event-name maps in `src/lib/posthog.ts`, resolving the earlier risk of dynamic event definitions.
- Bookmark add/remove actions emit `compare_bookmark_toggled` with `model_id` and `action` from `src/pages/Compare.tsx`, resolving the earlier activation-coverage gap.
- The stable client retained by `PostHogProvider` now forwards captures after deferred initialization, resolving silent loss of post-load component events.

## About this audit

The PostHog audit runs a five-stage chain: SDK installation → init correctness → identification → event capture → this report. Each stage checks the project's source tree and records every result, including passes.

- `error` items break correctness now (events lost, identity broken). Fix first.
- `warning` items work today but cause subtle data-quality bugs. Fix when convenient.
- `suggestion` items are best-practice improvements with measurable upside.

Re-run the PostHog audit after applying fixes to refresh these findings.
