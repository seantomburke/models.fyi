# PostHog analytics

Models.fyi uses PostHog for anonymous product analytics, session recordings, and client-side performance signals.

## What we track

- The PostHog SDK records one pageview on the first page and every client-side navigation.
- Explicit events record meaningful decisions, such as a homepage destination, a provider model choice, a comparison action, a quiz answer, or a completed calculator action.
- `data-attr` identifies important links and controls for autocapture. Use a short, stable value such as `home-cta-quiz`.

Do not send search text, model prompts, error messages, stack traces, names, email addresses, or other visitor-provided content as event properties or `data-attr` values.

## Adding an event

Capture an action in its event handler through the deferred analytics helper:

```ts
import { capture } from '../lib/analytics.ts'

capture('provider_model_clicked', {
  provider_id: provider.id,
  model_id: model.id,
})
```

Event names use lowercase snake case. Properties use stable IDs, counts, booleans, and small fixed categories. Use a property for a changing value instead of constructing an event name from it.

## Privacy defaults

- The SDK loads after first paint, so analytics never delays the page.
- Text content is masked in autocapture.
- Only elements with `data-attr` are eligible for autocapture.
- Input values, names, placeholders, and accessible labels are excluded from autocapture.
- Search-shaped URL parameters are masked before they leave the browser.
- Session recording stays enabled. Do not add text or form controls to `data-attr` containers.

## Configuration

Set these values in your local environment and deployment settings:

```sh
VITE_POSTHOG_PROJECT_TOKEN=<project-token>
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

The site continues to work when these variables are absent. Set them before testing analytics in a real browser.
