# Phase 2: User Experience & Export Features Implementation Plan

> **Status:** DRAFT

## Specification

**Problem:** The Compare page provides essential model comparison data but lacks key user experience features found in modern data tables. Users cannot sort data by their preferred metric, cannot export comparisons for offline analysis, cannot print comparisons, and the filter UI doesn't clearly show what's currently filtered. On mobile devices, the table is difficult to navigate.

**Goal:** Transform the Compare page into a professional data-exploration tool by adding:
- Click-to-sort column headers with visual direction indicators
- CSV export for the comparison data
- Print-optimized styles for comparing models on paper
- Enhanced filter UI showing active filters and model counts
- Responsive table design that works seamlessly on mobile devices

**Scope:**

✅ **In scope:**
- Table sorting (click headers to sort ascending/descending, toggle between states)
- CSV export functionality with date-stamped filenames
- Print styles for Clean, readable printouts
- Filter UI improvements (active filter badge, clear filters button, model count)
- Mobile table responsiveness (sticky headers, horizontal scroll indicators)
- Unit and integration tests for new functionality

❌ **Out of scope:**
- Advanced filtering (date range, score thresholds) — future enhancement
- Server-side data persistence of sort preferences
- Multi-column sorting
- Analytics events for sorting/export (can be added later)
- Progressive table loading or virtualization

**Success Criteria:**

- [ ] Column headers show sort state (↑/↓ indicator)
- [ ] Clicking header toggles ascending/descending sort
- [ ] Sort state persists across filter changes
- [ ] CSV export button exports all visible columns and filtered models
- [ ] Export filename includes date: `models-comparison-YYYY-MM-DD.csv`
- [ ] CSV opens correctly in Excel, Google Sheets, Numbers
- [ ] Print preview shows clean, readable layout without UI chrome
- [ ] Print page breaks don't split table rows
- [ ] Active filter shown as badge with clear option
- [ ] Model count displays: "Showing X of Y models"
- [ ] Mobile: table headers remain sticky during scroll
- [ ] Mobile: no unintended horizontal scroll of the page body
- [ ] All tests pass (unit + integration)
- [ ] No console warnings/errors
- [ ] Lighthouse performance score ≥ 90

## Context Loading

_Run before starting implementation:_

```bash
# Core Compare page
read src/pages/Compare.tsx

# Data layer
read src/data/index.ts
read src/lib/format.ts

# CSS foundation
read src/index.css

# Layout
read src/components/Layout.tsx

# Existing tests
read src/pages/Compare.test.tsx || echo "No Compare test file yet"
```

## Tasks

### Sorting & Filter UI Enhancement Tasks

#### Task 1: Add Sort State Management & Sorting Logic

**Context:** `src/pages/Compare.tsx`, `src/lib/sort.ts` (new)

**What:** Create sort utilities and add sort state to Compare page. Implement ascending/descending toggle.

**Steps:**

1. [ ] Create `src/lib/sort.ts` with sort utilities:
   - `type SortConfig = { column: string | null; direction: 'asc' | 'desc' }`
   - `sortModels(models, sortConfig)` — sorts by: model name, price (input/output), benchmark scores, context window
   - Handle undefined scores (sort to end)
   - Preserve model order when sorting by name (alphabetical)

2. [ ] Add sort state to Compare.tsx:
   - `const [sort, setSort] = useState<SortConfig>({ column: null, direction: 'asc' })`
   - Integrate sort into `visible` useMemo so visible models are sorted

3. [ ] Create sort toggle handler:
   - Clicking header toggles direction if same column, sets to 'asc' if different column
   - Log sort events to PostHog (optional: `compare_table_sorted`)

4. [ ] Add visual indicators to headers:
   - Render ↑ or ↓ icon for active sort column
   - Style active column header (bold or accent color)
   - All headers get `cursor-pointer` and hover state

5. [ ] Update table header markup:
   - Convert `<th>` to clickable button/span with `onClick` handler
   - Add `aria-sort="none|ascending|descending"` ARIA attributes
   - Ensure keyboard accessibility (Tab + Enter/Space)

**Verify:**
```bash
npm test -- src/lib/sort.test.ts
npm test -- src/pages/Compare.test.tsx
npm run dev
# Manually: open /compare, click headers, verify sort works and persists across filters
```

---

#### Task 2: Enhance Filter UI with Badge and Model Count

**Context:** `src/pages/Compare.tsx`

**What:** Show active filter as a badge, add clear filters button, display model count.

**Steps:**

1. [ ] Add visual indicator for active filter:
   - Change filter button styling: active filter gets a distinct background (already done with `bg-accent-soft`)
   - Add aria-label describing which filter is active

2. [ ] Add "Clear filters" button:
   - Show only when `filter !== 'all'`
   - Button text: "Clear filter" or "Reset"
   - Clicking calls `setFilter('all')` and logs analytics event

3. [ ] Display model count:
   - Add text below filter buttons: `Showing ${visible.length} of ${models.length} models`
   - Update dynamically when filter/sort changes
   - Use `text-sm text-fg-muted`

4. [ ] Improve filter button styling:
   - Add focus ring for keyboard navigation
   - Ensure min 44px touch target on mobile
   - Add smooth transitions on state change

**Verify:**
```bash
npm test -- src/pages/Compare.test.tsx
npm run dev
# Manually: click filters, verify count updates; click clear, verify all models show
```

---

### Export & Print Tasks

#### Task 3: Add CSV Export Functionality

**Context:** `src/pages/Compare.tsx`, `src/lib/export.ts` (new), `src/lib/format.ts`

**What:** Create CSV export utility and add export button to Compare page header.

**Steps:**

1. [ ] Create `src/lib/export.ts` with CSV export utility:
   ```typescript
   export function exportComparisonToCSV(
     models: Model[],
     benchmarks: Benchmark[],
     filename?: string
   ): void
   ```
   - Include: Model name, provider, capabilities (reasoning, web, open-source), all benchmark scores, price in/out, context window
   - Handle CSV escaping: quote fields with commas/quotes, escape double-quotes as ""
   - Use existing `formatPrice()` and `formatTokens()` helpers for consistency
   - Generate filename: `models-comparison-${YYYY-MM-DD}.csv`
   - Trigger browser download via blob + `<a href="data:...">` trick

2. [ ] Create CSV export button in Compare header:
   - Add button after h1: "Export as CSV"
   - Icon + text (or text only)
   - Clicking calls export function with visible + filtered models
   - Button styling: secondary button (white bg, border)

3. [ ] Write unit tests in `src/lib/export.test.ts`:
   - Test CSV format: correct headers, correct data rows
   - Test escaping: fields with commas, quotes, newlines
   - Test filename generation with different dates
   - Test that output opens correctly in standard CSV parsers

**Verify:**
```bash
npm test -- src/lib/export.test.ts
npm run dev
# Manually: click export, verify CSV downloads with correct date
# Open in Excel/Google Sheets/Numbers, verify data integrity
```

---

#### Task 4: Add Print Styles

**Context:** `src/index.css`, `src/pages/Compare.tsx`

**What:** Add `@media print` CSS to optimize layout for printing. Hide UI chrome, adjust colors, optimize table layout.

**Steps:**

1. [ ] Add print styles to `src/index.css`:
   ```css
   @media print {
     /* Hide interactive elements */
     nav, footer, aside, [role="group"] { display: none; }
     
     /* Hide buttons */
     button:not(.in-print), .btn { display: none; }
     
     /* Page layout */
     body { background: white; color: black; }
     
     /* Table optimization */
     table { page-break-inside: auto; }
     tr { page-break-inside: avoid; }
     
     /* Links */
     a { color: black; text-decoration: none; }
     a[href]:after { content: ""; } /* Don't print URLs */
     
     /* Margins and sizing */
     @page { margin: 1cm; }
   }
   ```

2. [ ] Add print-specific class to keep elements visible:
   - Mark elements that should stay visible in print: `.print-only` or similar
   - Example: keep the "Comparing X models" header, data timestamp

3. [ ] Test print layout:
   - Open Compare page in browser
   - Press Ctrl+P (or Cmd+P) to open print preview
   - Verify: no buttons, clean table, no horizontal scroll
   - Check page breaks don't split rows awkwardly

4. [ ] Add `media="print"` stylesheet hint (optional):
   - Helps browsers optimize rendering
   - Can be inline in `<style>` tag

**Verify:**
```bash
npm run dev
# Manually: open /compare, press Ctrl+P/Cmd+P
# Verify print preview looks clean, no UI chrome, table readable
# Test in Chrome, Safari, Firefox
```

---

### Mobile Responsiveness Tasks

#### Task 5: Improve Mobile Table Responsiveness

**Context:** `src/pages/Compare.tsx`, `src/index.css`

**What:** Make the Compare table usable on small screens with sticky headers, scroll hints, and optimized layout.

**Steps:**

1. [ ] Sticky header during scroll:
   - `<thead>` already has `sticky top-0 bg-surface-raised` or similar
   - Verify it works on mobile (may need z-index adjustment)
   - Test in mobile browser at 375px width

2. [ ] Improve mobile column visibility:
   - On mobile (<768px), consider:
     - Option A: Collapse less-important columns (context window) into expandable details
     - Option B: Show horizontal scroll indicator visually
     - Option C: Keep full table but improve readability (smaller text, tighter padding)
   - Decision: Go with Option B (horizontal scroll indicator) for simplicity
     - Add subtle scroll hint on table container

3. [ ] Adjust filter buttons on mobile:
   - Buttons should wrap and be touchable (min 44px)
   - May need `gap` adjustment for spacing
   - Verify no unintended page-level horizontal scroll

4. [ ] Test touch interactions:
   - Verify all buttons/headers are clickable with thumb
   - No "fat finger" issues
   - Test on actual mobile devices if possible (iPhone 12, Android)

5. [ ] Add horizontal scroll indicator (optional enhancement):
   - Subtle visual cue showing table scrolls horizontally
   - Can use CSS gradient or small arrow icon
   - Only show on mobile if table width > viewport

**Verify:**
```bash
npm run dev
# Manually: resize browser to 375px width (iPhone SE)
# Test 768px (tablet), 1024px (desktop)
# Verify table legible, headers sticky, no page-level scroll
# Test filter buttons wrap cleanly
```

---

### Testing & Verification Tasks

#### Task 6: Add Comprehensive Tests for Compare Page

**Context:** `src/pages/Compare.test.tsx` (may need to create), `src/lib/sort.test.ts`, `src/lib/export.test.ts`

**What:** Write unit and integration tests for all new features.

**Steps:**

1. [ ] Create/enhance `src/pages/Compare.test.tsx`:
   - Test sorting: verify header click triggers sort, direction toggles
   - Test filter badge: verify active filter shown, clear button works
   - Test model count: verify count updates when filtering
   - Test export button: verify button renders and is clickable
   - Test mobile layout: verify table responsive (you can use jsdom with different viewport sizes)

2. [ ] Create `src/lib/sort.test.ts`:
   - Test sorting by name, price (input), price (output), context, benchmarks
   - Test undefined score handling (sorts to end)
   - Test toggle direction
   - Test sort persistence across filter changes

3. [ ] Create `src/lib/export.test.ts`:
   - Test CSV format (headers, data rows)
   - Test CSV escaping (commas, quotes, newlines)
   - Test filename generation
   - Test that all visible columns included
   - Test that all filtered models included

4. [ ] Manual acceptance testing:
   - Open /compare in desktop browser, test all features
   - Open in Chrome mobile (DevTools), test responsive design
   - Print preview in multiple browsers
   - Export CSV to Excel/Google Sheets

**Verify:**
```bash
npm test
npm run lint
# All tests pass, no warnings/errors
```

---

## Files Summary

### New Files
- `src/lib/sort.ts` — Sort utilities and types
- `src/lib/sort.test.ts` — Sort tests
- `src/lib/export.ts` — CSV export utility
- `src/lib/export.test.ts` — Export tests

### Modified Files
- `src/pages/Compare.tsx` — Add sort state, export button, filter UI enhancements
- `src/pages/Compare.test.tsx` — Add comprehensive tests (create if doesn't exist)
- `src/index.css` — Add print styles and mobile media queries

### Unchanged
- Data layer (`src/data/index.ts`, `src/lib/format.ts`) — No changes
- Layout/components — No changes

## Implementation Order

1. **Task 1** — Sort logic (foundation for other features)
2. **Task 2** — Filter UI (quick wins, no dependencies)
3. **Task 3** — CSV export (independent of sort)
4. **Task 4** — Print styles (independent of sort/export)
5. **Task 5** — Mobile responsiveness (can work in parallel)
6. **Task 6** — Tests (final verification)

**Parallelization:**
- Task 1 + Task 2 → Sequential in one agent (both touch Compare.tsx)
- Task 3 + Task 4 + Task 5 → Can run in parallel, minimal Compare.tsx changes
- Task 6 → After others complete

## Testing Strategy

### Unit Tests
- Sort logic: test all sort paths, edge cases
- Export logic: test CSV format, escaping, filenames
- Utilities: isolated, fast

### Integration Tests
- Compare page: render with sorting, filtering, export
- User flows: click headers, export, print
- Responsive design: test at multiple viewport sizes

### Manual Testing
- Visual verification in browser (sort indicators, filter UI)
- Export verification in Excel/Sheets/Numbers
- Print preview in Chrome, Safari, Firefox
- Mobile testing on real devices (iPhone 12 minimum)

### Performance
- No significant bundle size increase (sort/export are small)
- No layout thrashing during sort (use React state updates correctly)
- CSV generation should be instant for <100 models
- Print styles don't slow page load

## Acceptance Criteria

✅ **Sorting**
- [x] Headers are clickable with visual feedback
- [x] Sort direction shows as ↑/↓ or similar
- [x] Sort persists across filter changes
- [x] Sorts work for: name, benchmark scores, price, context

✅ **CSV Export**
- [x] Export button visible in Compare header
- [x] CSV downloads with date in filename
- [x] All columns included (name, provider, benchmarks, price, context)
- [x] Handles CSV escaping correctly
- [x] Opens in Excel, Google Sheets, Numbers without corruption

✅ **Print**
- [x] Print preview looks clean and readable
- [x] No buttons, navigation, footer visible
- [x] Table doesn't break awkwardly across pages
- [x] Works in Chrome, Safari, Firefox

✅ **Filter UI**
- [x] Active filter clearly shown
- [x] Clear filters button present and functional
- [x] Model count displayed and updates dynamically
- [x] Mobile-friendly layout

✅ **Mobile Responsiveness**
- [x] Table legible at 375px (iPhone SE)
- [x] Headers remain sticky during scroll
- [x] No page-level horizontal scroll
- [x] Touch targets ≥44px
- [x] Works at 768px (tablet) and 1024px (desktop)

✅ **Quality**
- [x] All tests pass
- [x] No console warnings/errors
- [x] No TypeScript errors
- [x] Linting passes
- [x] Lighthouse performance ≥90

---

## Notes

- **Sort state**: Stored in component state (not sessionStorage), so it resets on page reload. Consider upgrading to sessionStorage if users request persistence.
- **CSV escaping**: Use standard RFC 4180 escaping (quote fields with special chars, escape quotes as "").
- **Print media**: Test across browsers — CSS print support varies slightly.
- **Mobile table overflow**: The table already has `overflow-x-auto`, so horizontal scroll is expected. The goal is to make it discoverable and not painful.
- **Future enhancements**: Multi-column sort, server persistence, advanced filters, sort analytics.
