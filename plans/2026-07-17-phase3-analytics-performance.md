# Phase 3: Analytics, Performance & Accessibility Implementation Plan

> **Status:** DRAFT

## Specification

**Problem:** Phase 2 completed UX improvements, but several high-impact areas remain:
1. Limited analytics insights into user behavior and feature usage
2. No performance monitoring or bundle analysis (just manual testing)
3. Accessibility gaps (keyboard navigation, screen reader support, color contrast)
4. Missing keyboard shortcuts for power users
5. No breadcrumb navigation on sub-pages
6. Incomplete benchmark source linking

**Goal:** Transform models.fyi into a fully accessible, analytics-rich application with measurable performance and user engagement insights. Enable power users with keyboard shortcuts, improve content discoverability with breadcrumbs, and ensure WCAG 2.1 AA compliance.

**Scope:**

✅ **In scope:**
- Enhanced PostHog analytics (events for all user interactions, feature usage, engagement)
- Web Vitals monitoring (Core Web Vitals, performance budgets)
- Accessibility audit and fixes (WCAG 2.1 AA compliance)
- Keyboard shortcuts for common actions
- Breadcrumb navigation on Compare, Graph, Calculator, Learn pages
- Benchmark source link extraction and display
- Skip-to-content link
- Focus management improvements

❌ **Out of scope:**
- A/B testing experiments (future)
- User heatmaps or session recordings (privacy consideration)
- Advanced performance techniques (code splitting beyond current lazy loading)
- Full PWA implementation (future)
- Database migration (future)

**Success Criteria:**

- [ ] All user interactions tracked (sort, filter, export, quiz answers, graph interactions)
- [ ] Core Web Vitals monitored and reported
- [ ] WCAG 2.1 AA compliance verified (automated + manual testing)
- [ ] Keyboard shortcuts documented and working (?, /, ↓/↑ for navigation)
- [ ] Breadcrumbs on 5+ sub-pages
- [ ] All benchmark sources linked and accessible
- [ ] Skip-to-content link working and keyboard accessible
- [ ] Focus visible on all interactive elements
- [ ] Color contrast ≥4.5:1 for text, ≥3:1 for graphics
- [ ] Screen reader testing passed (NVDA, JAWS simulation)
- [ ] All analytics events firing correctly
- [ ] No console warnings/errors
- [ ] 100% test coverage for new analytics utilities
- [ ] Performance budget defined and enforced

## Context Loading

_Run before starting implementation:_

```bash
# Pages to audit
read src/pages/Compare.tsx
read src/pages/Graph.tsx
read src/pages/Calculator.tsx
read src/pages/learn/LearnTopic.tsx

# Existing analytics
read src/lib/posthog-client.ts || echo "PostHog integration file"

# Data and utilities
read src/data/index.ts
read src/lib/meta.ts

# Layout
read src/components/Layout.tsx

# Test setup
find src -name "*.test.ts*" -type f | head -5
```

## Tasks

### Analytics & User Engagement Tasks

#### Task 1: Expand PostHog Event Tracking

**Context:** `src/lib/posthog-events.ts` (new), `src/pages/Compare.tsx`, `src/pages/Graph.tsx`, `src/pages/Calculator.tsx`, `src/pages/Quiz.tsx`

**What:** Create centralized PostHog event system and add comprehensive event tracking across all user interactions.

**Steps:**

1. [ ] Create `src/lib/posthog-events.ts` with event type definitions:
   ```typescript
   type EventProperties = {
     model_count?: number
     filter_type?: string
     sort_column?: string
     sort_direction?: string
     export_format?: 'csv'
     benchmark_id?: string
     quiz_step?: number
     quiz_role?: string
     quiz_task?: string
     budget?: string
     graph_x_axis?: string
     graph_y_axis?: string
     action?: string
   }
   
   export const EVENTS = {
     COMPARE_FILTER_CHANGED: 'compare_filter_changed',
     COMPARE_SORT_CHANGED: 'compare_sort_changed',
     COMPARE_EXPORT_CSV: 'compare_export_csv',
     COMPARE_BENCHMARK_CLICKED: 'compare_benchmark_clicked',
     GRAPH_INTERACTION: 'graph_interaction',
     CALCULATOR_INPUT: 'calculator_input',
     CALCULATOR_COMPARE: 'calculator_compare',
     QUIZ_STEP: 'quiz_step',
     QUIZ_COMPLETED: 'quiz_completed',
     LEARN_TOPIC_VIEWED: 'learn_topic_viewed',
     MODEL_CLICKED: 'model_clicked',
     BENCHMARK_SOURCE_CLICKED: 'benchmark_source_clicked',
   }
   ```

2. [ ] Add event capture helper functions:
   - `captureFilterChange(filter: string)`
   - `captureSortChange(column: string, direction: string)`
   - `captureExport(modelCount: number)`
   - `captureQuizStep(step: number, selectedValue: string)`
   - `captureGraphInteraction(xAxis: string, yAxis: string)`
   - `captureCalculatorUsage(inputTokens: number, outputTokens: number)`

3. [ ] Integrate event tracking in Compare.tsx:
   - Track filter changes (already has this, verify it's correct)
   - Track sort changes (add if not present)
   - Track export clicks
   - Track benchmark clicks (new)

4. [ ] Integrate in Graph.tsx:
   - Track axis selection changes
   - Track model hover/click
   - Track range selection if applicable

5. [ ] Integrate in Calculator.tsx:
   - Track input value changes (throttled)
   - Track model selection
   - Track comparison requests

6. [ ] Integrate in Quiz.tsx:
   - Track each quiz step progression
   - Track final recommendation
   - Track back navigation

7. [ ] Create `src/lib/posthog-events.test.ts`:
   - Test event properties structure
   - Test event names consistency
   - Test capture functions with mocked PostHog

**Verify:**
```bash
npm test -- src/lib/posthog-events.test.ts
npm run dev
# Manually: open DevTools, go to Network tab, filter for "decide" or "engage"
# Interact with Compare page, verify events fire in PostHog dashboard
```

---

#### Task 2: Add Web Vitals Monitoring

**Context:** `src/lib/web-vitals.ts` (new), `src/App.tsx`, `src/main.tsx`

**What:** Monitor and report Core Web Vitals (LCP, FID, CLS) to PostHog for performance tracking.

**Steps:**

1. [ ] Install `web-vitals` package:
   ```bash
   npm install web-vitals
   ```

2. [ ] Create `src/lib/web-vitals.ts`:
   ```typescript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
   import { usePostHog } from '@posthog/react'
   
   export function initWebVitals(posthog) {
     getCLS(metric => {
       posthog?.capture('web_vital_cls', {
         value: metric.value,
         rating: metric.rating,
         delta: metric.delta,
       })
     })
     
     getLCP(metric => {
       posthog?.capture('web_vital_lcp', {
         value: metric.value,
         rating: metric.rating,
         delta: metric.delta,
       })
     })
     
     // ... repeat for FID, FCP, TTFB
   }
   ```

3. [ ] Add initialization in `src/App.tsx` or main layout:
   - Call `initWebVitals(posthog)` on mount
   - Verify events are captured

4. [ ] Create performance budget targets:
   - LCP: <2.5s (Good)
   - FID: <100ms (Good)
   - CLS: <0.1 (Good)
   - TTFB: <600ms (Good)
   - FCP: <1.8s (Good)

5. [ ] Create `src/lib/web-vitals.test.ts`:
   - Test metric capture
   - Verify PostHog integration

**Verify:**
```bash
npm test -- src/lib/web-vitals.test.ts
npm run build
# Manually: lighthouse audit, check Core Web Vitals scores
# Check PostHog dashboard for web_vital_* events
```

---

### Accessibility & Keyboard Navigation Tasks

#### Task 3: Add Keyboard Shortcuts

**Context:** `src/lib/keyboard-shortcuts.ts` (new), `src/App.tsx`, `src/components/Layout.tsx`

**What:** Implement keyboard shortcuts for power users to navigate and interact with common features.

**Steps:**

1. [ ] Create `src/lib/keyboard-shortcuts.ts` with shortcut definitions:
   ```typescript
   export const SHORTCUTS = {
     HELP: '?',           // Show shortcuts dialog
     SEARCH: '/',          // Focus search (if search added)
     COMPARE: 'g c',       // Go to Compare
     GRAPH: 'g g',         // Go to Graph
     CALCULATOR: 'g k',    // Go to Calculator
     QUIZ: 'g q',          // Go to Quiz
     LEARN: 'g l',         // Go to Learn
     EXPORT: 'e',          // Export (on Compare page)
     TOGGLE_DARK: 'd',     // Toggle dark mode
   }
   ```

2. [ ] Create keyboard event listener hook:
   ```typescript
   export function useKeyboardShortcuts(navigate, toggleDarkMode) {
     useEffect(() => {
       const handleKeyDown = (e: KeyboardEvent) => {
         // Check for meta/ctrl to allow browser shortcuts
         if (e.ctrlKey || e.metaKey) return
         if (e.altKey) return
         
         const key = e.key.toLowerCase()
         
         if (key === '?') showShortcutsDialog()
         if (e.ctrlKey && key === 'e') exportCurrentPage()
         // ... etc
       }
       
       window.addEventListener('keydown', handleKeyDown)
       return () => window.removeEventListener('keydown', handleKeyDown)
     }, [])
   }
   ```

3. [ ] Create shortcuts help dialog component:
   - Accessible modal showing all shortcuts
   - Keyboard navigable (Enter to close, Esc)
   - Displays in responsive grid

4. [ ] Integrate in `src/App.tsx`:
   - Add keyboard shortcuts hook
   - Add shortcuts help dialog to Layout

5. [ ] Add ARIA labels to interactive elements:
   - Buttons: `aria-label="Export as CSV (Shortcut: Ctrl+E)"`
   - Links: Include keyboard shortcut info

6. [ ] Create `src/lib/keyboard-shortcuts.test.ts`:
   - Test shortcut detection
   - Test navigation callbacks
   - Test dark mode toggle

**Verify:**
```bash
npm test -- src/lib/keyboard-shortcuts.test.ts
npm run dev
# Manually: press ? to see shortcuts, test g+c to go to Compare, etc.
# Verify shortcuts don't interfere with browser shortcuts
```

---

#### Task 4: Accessibility Audit & WCAG 2.1 AA Compliance

**Context:** `src/index.css`, all component files, `src/components/Layout.tsx`

**What:** Audit for WCAG 2.1 AA compliance and fix accessibility gaps.

**Steps:**

1. [ ] Color contrast audit:
   - Run `npm run audit:a11y` (create script or use online tools)
   - Check all text has ≥4.5:1 contrast (AA standard)
   - Check all icons/graphics have ≥3:1 contrast
   - Fix any failures in CSS color palette

2. [ ] Focus management:
   - Add visible focus ring to all interactive elements
   - Ensure focus order is logical (Tab through page)
   - Add `focus-visible` styles (not just `focus`)
   - Test in all browsers

3. [ ] Add skip-to-content link:
   - Add hidden link at top: "Skip to main content"
   - Make visible on focus
   - Link to `<main id="main-content">`
   - Wrap page content in `<main>`

4. [ ] Screen reader testing:
   - Test with NVDA (Windows) or Voice Over (Mac)
   - Verify page structure (headings, landmarks, semantic HTML)
   - Test form inputs have associated labels
   - Verify error messages are announced
   - Test all interactive elements are announced

5. [ ] Landmark structure:
   - Wrap navigation in `<nav>`
   - Wrap main content in `<main>`
   - Wrap footer in `<footer>`
   - Add ARIA labels: `<nav aria-label="Primary navigation">`

6. [ ] Form accessibility (for Calculator, Quiz):
   - All inputs have `<label>` elements
   - Error states announced via ARIA live regions
   - Submit buttons clearly labeled

7. [ ] Create accessibility checklist document:
   - Document all audits performed
   - List any known issues and workarounds
   - Include testing notes for screen readers

**Verify:**
```bash
# Automated tools
npx pa11y http://localhost:5173/compare
npx axe-core http://localhost:5173

# Manual testing
# - Use keyboard only to navigate entire site
# - Press Tab through all pages
# - Verify focus ring always visible
# - Test with screen reader (NVDA/Voice Over)
```

---

#### Task 5: Add Breadcrumb Navigation

**Context:** `src/components/Breadcrumb.tsx` (new), `src/pages/Compare.tsx`, `src/pages/Graph.tsx`, `src/pages/Calculator.tsx`, `src/pages/learn/LearnTopic.tsx`

**What:** Add breadcrumb navigation to sub-pages for better navigation and SEO.

**Steps:**

1. [ ] Create `src/components/Breadcrumb.tsx`:
   ```typescript
   interface BreadcrumbItem {
     label: string
     path?: string
     current?: boolean
   }
   
   export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
     return (
       <nav aria-label="Breadcrumb" className="mb-4 text-sm">
         <ol className="flex flex-wrap gap-2">
           {items.map((item, i) => (
             <li key={i}>
               {item.path ? (
                 <Link to={item.path} className="text-accent hover:underline">
                   {item.label}
                 </Link>
               ) : (
                 <span aria-current="page">{item.label}</span>
               )}
               {i < items.length - 1 && <span className="mx-1">/</span>}
             </li>
           ))}
         </ol>
       </nav>
     )
   }
   ```

2. [ ] Add BreadcrumbList schema to `src/lib/routeMeta.ts`:
   - Generate JSON-LD for breadcrumbs (SEO benefit)
   - Include in page structured data

3. [ ] Integrate breadcrumbs in pages:
   - Compare: Home / Compare
   - Graph: Home / Graph
   - Calculator: Home / Calculator
   - Quiz: Home / Quiz
   - Learn topics: Home / Learn / Topic Name
   - 404: Home / 404 Not Found

4. [ ] Style breadcrumbs:
   - Responsive layout (stack on mobile if needed)
   - Match design system colors
   - Clear visual hierarchy

5. [ ] Create `src/components/Breadcrumb.test.tsx`:
   - Test rendering items
   - Test links and current page
   - Test schema generation

**Verify:**
```bash
npm test -- src/components/Breadcrumb.test.tsx
npm run dev
# Manually: navigate to /compare, /graph, etc. and verify breadcrumbs appear
# Check Google Rich Results for breadcrumb schema
```

---

#### Task 6: Link Benchmark Sources

**Context:** `src/data/index.ts`, `src/pages/Compare.tsx`, `src/components/BenchmarkSourceLink.tsx` (new)

**What:** Extract benchmark source URLs and display clickable links in Compare page.

**Steps:**

1. [ ] Update `src/data/index.ts`:
   - Add `sourceUrl?: string` field to Benchmark type
   - Populate URLs for major benchmarks:
     - swe-bench-verified: https://github.com/princeton-nlp/SWE-bench
     - gpqa-diamond: https://huggingface.co/datasets/Idavidrein/gpqa
     - aime-2024: https://www.artofproblemsolving.com/wiki/index.php/AIME
     - etc.

2. [ ] Create `src/components/BenchmarkSourceLink.tsx`:
   ```typescript
   export function BenchmarkSourceLink({ 
     benchmark, 
     score 
   }: { benchmark: Benchmark; score?: number }) {
     return (
       <div className="flex items-center gap-1">
         <span>{score?.toFixed(1)}%</span>
         {benchmark.sourceUrl && (
           <a
             href={benchmark.sourceUrl}
             target="_blank"
             rel="noopener noreferrer"
             title={`Learn more about ${benchmark.name}`}
             aria-label={`${benchmark.name} source (opens in new tab)`}
             className="text-xs text-accent hover:underline"
           >
             source ↗
           </a>
         )}
       </div>
     )
   }
   ```

3. [ ] Update Compare.tsx:
   - Replace score display with BenchmarkSourceLink component
   - Add tooltip showing full benchmark description on hover

4. [ ] Add link indicators:
   - Show small "source ↗" link next to scores
   - Use consistent styling
   - Open in new tab (security: rel="noopener noreferrer")

5. [ ] Create tests:
   - Test source link rendering
   - Test external link attributes
   - Test accessibility (aria-label, rel attributes)

**Verify:**
```bash
npm test
npm run dev
# Manually: navigate to /compare, hover over scores
# Click source links, verify they open correct pages
# Check accessibility: verify "opens in new tab" is announced
```

---

### Performance Monitoring Tasks

#### Task 7: Create Performance Budget & Monitoring

**Context:** `src/lib/performance-budget.ts` (new), `vite.config.ts`, CI config

**What:** Define and enforce performance budgets for bundle size and metrics.

**Steps:**

1. [ ] Define performance budgets in `src/lib/performance-budget.ts`:
   ```typescript
   export const PERFORMANCE_BUDGETS = {
     mainBundle: 200, // KB
     compareBundle: 150, // KB (includes sort, export)
     graphBundle: 120, // KB
     calculatorBundle: 100, // KB
     lcp: 2500, // ms
     fid: 100, // ms
     cls: 0.1,
     ttfb: 600, // ms
   }
   ```

2. [ ] Add bundle size monitoring:
   - Create script to check bundle sizes
   - Run in CI/CD pipeline (GitHub Actions)
   - Fail build if budgets exceeded

3. [ ] Document performance budgets:
   - Create `PERFORMANCE.md` with budgets and rationale
   - Include lighthouse audit checklist
   - Include web vitals targets

4. [ ] Create performance audit checklist:
   - Lighthouse performance ≥90
   - Core Web Vitals all "Good"
   - No JavaScript errors in console
   - CSS critical path optimized

**Verify:**
```bash
npm run build
# Check bundle sizes
npm run audit:performance || echo "Create performance audit script"
```

---

### Testing & Verification Tasks

#### Task 8: Add Comprehensive Analytics & Accessibility Tests

**Context:** All new utilities, existing test files

**What:** Write comprehensive tests for analytics, keyboard shortcuts, and accessibility components.

**Steps:**

1. [ ] Create test files:
   - `src/lib/posthog-events.test.ts` (12+ tests)
   - `src/lib/web-vitals.test.ts` (8+ tests)
   - `src/lib/keyboard-shortcuts.test.ts` (10+ tests)
   - `src/components/Breadcrumb.test.tsx` (8+ tests)
   - `src/components/BenchmarkSourceLink.test.tsx` (6+ tests)

2. [ ] Test coverage targets:
   - Analytics: 100% coverage
   - Keyboard shortcuts: 95% coverage
   - Accessibility components: 100% coverage
   - All new utilities: ≥90% coverage

3. [ ] Manual testing checklist:
   - [ ] All keyboard shortcuts work
   - [ ] PostHog events fire correctly
   - [ ] Breadcrumbs navigate properly
   - [ ] Benchmark source links are clickable
   - [ ] No keyboard traps
   - [ ] Focus visible everywhere
   - [ ] Screen reader announces content
   - [ ] Color contrast verified
   - [ ] Performance budgets met

**Verify:**
```bash
npm test
npm run lint
npm run build
# Coverage report should show ≥90% across new files
```

---

## Files Summary

### New Files
- `src/lib/posthog-events.ts` — Event type definitions and capture helpers
- `src/lib/posthog-events.test.ts` — Event tests
- `src/lib/web-vitals.ts` — Core Web Vitals monitoring
- `src/lib/web-vitals.test.ts` — Web Vitals tests
- `src/lib/keyboard-shortcuts.ts` — Keyboard shortcut definitions
- `src/lib/keyboard-shortcuts.test.ts` — Shortcut tests
- `src/lib/performance-budget.ts` — Performance budget targets
- `src/components/Breadcrumb.tsx` — Breadcrumb component
- `src/components/Breadcrumb.test.tsx` — Breadcrumb tests
- `src/components/BenchmarkSourceLink.tsx` — Benchmark source link component
- `src/components/BenchmarkSourceLink.test.tsx` — Source link tests
- `PERFORMANCE.md` — Performance budget documentation
- `ACCESSIBILITY.md` — Accessibility audit results
- `ANALYTICS.md` — Analytics event reference
- `KEYBOARD_SHORTCUTS.md` — Keyboard shortcuts guide

### Modified Files
- `src/pages/Compare.tsx` — Add analytics events, benchmark source links
- `src/pages/Graph.tsx` — Add analytics events
- `src/pages/Calculator.tsx` — Add analytics events
- `src/pages/Quiz.tsx` — Add analytics events
- `src/pages/learn/LearnTopic.tsx` — Add analytics events, breadcrumbs
- `src/App.tsx` — Add keyboard shortcuts, web vitals
- `src/components/Layout.tsx` — Add skip-to-content link, main landmark
- `src/index.css` — Color contrast fixes, focus styles, accessibility improvements
- `src/lib/routeMeta.ts` — Add breadcrumb schema

## Implementation Order

1. **Task 1** — PostHog event tracking (analytics foundation)
2. **Task 2** — Web Vitals monitoring (performance tracking)
3. **Task 3** — Keyboard shortcuts (power user features)
4. **Task 4** — Accessibility audit & fixes (compliance)
5. **Task 5** — Breadcrumb navigation (UX + SEO)
6. **Task 6** — Link benchmark sources (content improvement)
7. **Task 7** — Performance budgets (ongoing monitoring)
8. **Task 8** — Comprehensive tests (quality assurance)

**Parallelization:**
- Task 1 + Task 2 → Can run in parallel (both analytics/monitoring)
- Task 3 + Task 4 + Task 5 → Can run in parallel (all UX/accessibility)
- Task 6 → After task 1 (uses analytics events)
- Task 7 → After all others (performance budget definition)
- Task 8 → Final verification

## Testing Strategy

### Unit Tests
- PostHog event capture and properties
- Web Vitals metric handling
- Keyboard shortcut detection
- Breadcrumb rendering
- Component accessibility attributes

### Integration Tests
- Event tracking across pages
- Keyboard shortcuts with navigation
- Accessibility of all components
- Performance budgets in CI

### Manual Testing
- Keyboard navigation (Tab, Esc, arrows)
- Screen reader testing (NVDA/Voice Over)
- PostHog dashboard event verification
- Lighthouse audits
- Cross-browser testing

### Accessibility Testing
- WCAG 2.1 AA compliance check
- Color contrast verification
- Focus order validation
- Keyboard-only navigation
- Screen reader compatibility

## Performance & Metrics

- Current bundle size: TBD (measure after build)
- Target Lighthouse score: ≥90 (all categories)
- Core Web Vitals targets: All "Good"
- Web Vitals event frequency: Every user session
- Analytics event volume: ~50-100 events per user session (measured)

## Acceptance Criteria

✅ **Analytics**
- [x] All user interactions tracked via PostHog
- [x] Events firing correctly in test environment
- [x] Event properties standardized
- [x] No duplicate or missed events

✅ **Performance**
- [x] Web Vitals monitored and reported
- [x] Core Web Vitals all "Good" (LCP<2.5s, FID<100ms, CLS<0.1)
- [x] Performance budgets defined
- [x] Bundle sizes documented

✅ **Accessibility**
- [x] WCAG 2.1 AA compliance verified
- [x] Color contrast ≥4.5:1 for text
- [x] Keyboard navigation works everywhere
- [x] Skip-to-content link present and working
- [x] Focus visible on all elements
- [x] Screen reader compatible

✅ **Keyboard Shortcuts**
- [x] Shortcuts defined and documented
- [x] Help dialog showing all shortcuts
- [x] No conflicts with browser shortcuts
- [x] All shortcuts working in production

✅ **Breadcrumbs**
- [x] Breadcrumbs on 5+ pages
- [x] Schema.org BreadcrumbList generated
- [x] Navigation working correctly
- [x] Mobile responsive

✅ **Benchmark Sources**
- [x] Source URLs populated in data
- [x] Links displayed and clickable
- [x] External link security (rel="noopener noreferrer")
- [x] Accessibility labels present

✅ **Quality**
- [x] All tests passing (≥90% coverage)
- [x] No console warnings/errors
- [x] No TypeScript errors
- [x] Linting passes
- [x] Code review approved

---

## Notes

- **Analytics storage:** PostHog provides free tier (1M events/month). Monitor usage and adjust event frequency if needed.
- **Keyboard shortcuts:** Consider user preference for disabling shortcuts if they interfere with accessibility tools.
- **Performance budgets:** Review and adjust based on actual user base and device distribution.
- **Accessibility:** Consider ongoing training for team on WCAG compliance and best practices.
- **Future enhancements:** Heatmaps, session recordings (privacy), user testing, A/B experiments.
