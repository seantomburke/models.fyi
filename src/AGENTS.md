# Frontend Guidance (src/)

Extends the root `AGENTS.md` with rules for code under `src/`.

## React Patterns

When building data-heavy or dashboard-style UI, follow `.agents/skills/design/SKILL.md`.

### Component Structure

- Prefer function components with hooks
- Keep components focused on one responsibility
- Extract custom hooks for reusable logic
- Style with Tailwind utility classes; avoid ad-hoc CSS files

### SEO and Accessibility

SEO is a product requirement, not an afterthought.

- Use semantic HTML (`<main>`, `<section>`, `<h1>`–`<h6>` in order, `<nav>`)
- Set page `<title>` and meta description per route
- Give every image meaningful `alt` text; label interactive elements

### Data Access

Model and benchmark data are hardcoded for now. Import from the typed data module rather than inlining literals in components, so the eventual database migration stays contained.

## Error Handling

When designing error handling, follow `.agents/skills/handling-errors/SKILL.md`.

Key principles:
- Never swallow errors silently
- Preserve error context when re-throwing
- Log errors once at the appropriate boundary

## Testing

When writing tests, follow `.agents/skills/writing-tests/SKILL.md`. When fixing flaky tests, follow `.agents/skills/fixing-flaky-tests/SKILL.md`.

```bash
npm test              # Run all tests (vitest)
npm test -- --watch   # Watch mode
```

| Symptom | Likely Cause |
|---------|--------------|
| Passes alone, fails in suite | Shared state |
| Random timing failures | Race condition |

### Components

Use Testing Library idioms:

```typescript
import { render, screen } from '@testing-library/react'

test('renders model name', () => {
  render(<ModelCard name="Opus 4.8" />)
  expect(screen.getByText('Opus 4.8')).toBeInTheDocument()
})
```

### HTTP Mocking

Use MSW for API mocking:

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/models', () => {
    return HttpResponse.json([{ id: 'opus', name: 'Opus' }])
  }),
]
```

### Async Waiting

```typescript
await waitFor(() => expect(element).toBeVisible())
// NOT: await sleep(500)
```
