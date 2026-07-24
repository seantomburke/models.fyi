# Frontend Gotchas

Hard-won traps in this codebase. Each entry states the trap and the correct move.

## Tailwind and CSS

- Tailwind v4 `space-y-*` sets `margin-bottom` via `:where()`. A child's own `mb-*` REPLACES the rhythm instead of adding to it, so `-mb-8` inside `space-y-8` produces overlap. Never shave `space-y` gaps with negative margins; adjust the container.
- Unlayered rules in `index.css` beat Tailwind utilities. Keep new global CSS inside layers. Test mobile rendering in Playwright WebKit.

## Accessibility

- A `<label>` placed as a SIBLING of an input names nothing; sliders end up unnamed. Wrap the input in the label (then no `aria-label` is needed). Grep alone misleads here; check the accessibility tree.
- Respect `prefers-reduced-motion` in every animation (pin the clock to a fixed phase so a still frame renders).
- Never add printable-character global keyboard shortcuts. They were removed deliberately.

## Charts (openchart)

- openchart ignores `strokeDash`/`opacity` on rule mark definitions (it reads them from encoded fields) and rejects quantitative x on line marks. Assert the rendered SVG in tests, never the spec shape.
- Axis scaling goes through the shared `axisScale()` (crops axes to the data, auto-logs wide ranges). Both renderers and the rule layer must share it. Never project as value/max.

## Interaction

- Interactive cards with links inside buttons are invalid HTML; render the card as a sibling of the point button.
- Touch drag input retargets pointer events; `pointerup` precedes `click` (see `PixelGrid`).
- `ScrollToTop` keys on pathname; new route families inherit it.

## Lazy chunks and deploys

- Every Pages deploy removes the previous build's hash-named chunks. A returning visitor whose tab still holds the old `index.html` requests a chunk that no longer exists, so the lazy `import()` rejects with "Failed to fetch dynamically imported module" / "Importing a module script failed" and lands on the error boundary. This was the top error-boundary source in production (17 of 19 crashes over 60 days, mostly on `/learn`). `createRetryableRouteLoader` (`src/routePreload.ts`) detects that signature via `isStaleChunkError` and triggers one hard reload to fetch the fresh `index.html`, guarded by a `models-wtf:chunk-reload` sessionStorage flag so a genuinely broken deploy can't reload-loop; the guard clears on the next successful load. Do not "simplify" the loader's catch back to a plain re-throw.
