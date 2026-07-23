# Phase 2: User Experience & Export Features

## Overview
Improve the Compare table experience with sorting/filtering enhancements and add CSV export capability. Also add print styles so users can print comparisons.

## Tasks

### 1. Add Table Sorting to Compare Page
**Files to modify:**
- `src/pages/Compare.tsx`
- Possibly create `src/components/SortableTable.tsx`

**Work:**
- Add sortable column headers (click to sort)
- Show sort direction indicator (↑ / ↓)
- Remember sort preference (session storage or state)
- Sort by: Model name, price (input/output), benchmark scores
- Clicking header toggles ascending/descending

**Success criteria:**
- Headers are clickable with visual feedback
- Sorting works correctly for all columns
- Sort indicator shows direction
- No console warnings
- Tests pass

### 2. Add CSV Export for Compare Table
**Files to modify:**
- `src/pages/Compare.tsx`
- Possibly create `src/lib/export.ts`

**Work:**
- Add "Export as CSV" button
- Include all visible columns in export
- Handle special characters and escaping properly
- Export filename: `models-comparison-[date].csv`
- Only export filtered models (respects current filter)

**Success criteria:**
- Button appears in Compare page header
- Exported CSV opens correctly in Excel, Google Sheets
- All visible columns included
- Filename includes date
- No data corruption in export

### 3. Add Print Styles
**Files to modify:**
- `src/index.css` or new `src/styles/print.css`
- Update any component that needs print-specific styling

**Work:**
- Hide navigation, footer, sidebars on print
- Optimize table layout for print (break tables across pages cleanly)
- Adjust colors for print (no dark backgrounds)
- Hide interactive elements (buttons, toggles)
- Add "Print optimized" message or page breaks where needed
- Test with browser print preview

**Success criteria:**
- Print preview looks clean and readable
- Tables don't break awkwardly
- All data visible and legible
- No interactive elements visible in print
- Works across browsers (Chrome, Safari, Firefox)

### 4. Enhance Filter UI/UX
**Files to modify:**
- `src/pages/Compare.tsx`
- Possibly create `src/components/FilterBar.tsx`

**Work:**
- Improve filter button styling and accessibility
- Show active filter indicator (badge with "X" to clear)
- Add "Clear filters" button
- Show count of models after filtering: "Showing X of Y models"
- Better mobile layout for filters

**Success criteria:**
- Active filter clearly visible
- Users can easily see what's filtered
- Can clear filters with one click
- Count updates when filtering
- Mobile-friendly

### 5. Improve Table Responsiveness
**Files to modify:**
- `src/pages/Compare.tsx`
- May need new component or style adjustments

**Work:**
- On mobile, consider horizontal scroll indicator
- Sticky header on scroll (keep column headers visible)
- Make table easier to read on small screens
- Consider: collapse some columns on mobile, show expand/collapse for model details
- Test on real mobile devices

**Success criteria:**
- Table legible on iPhone/Android
- No horizontal scroll surprise
- Headers remain visible while scrolling
- Touch-friendly interactions

## Files Summary
- `src/pages/Compare.tsx` - Main table page (sorting, filtering, export)
- `src/lib/export.ts` - CSV export utility (new)
- `src/components/FilterBar.tsx` - Filter UI component (optional, new)
- `src/components/SortableTable.tsx` - Table wrapper with sorting (optional, new)
- `src/index.css` or print stylesheet - Print styles

## Testing
- Manual testing on desktop: click sort, export, print preview
- Mobile testing: iPhone SE, iPhone 12+, Android phone (landscape & portrait)
- Browser testing: Chrome, Safari, Firefox, Edge
- Export testing: Open CSV in Excel, Google Sheets, Numbers
- Print testing: Print preview in each browser

## Acceptance Criteria
✅ Table sorting works for all columns
✅ CSV export includes all visible data
✅ Export filename includes date
✅ Print preview looks professional and readable
✅ Mobile table is usable (no awkward scrolling)
✅ Active filter clearly shown with clear option
✅ Model count shown after filtering
✅ All tests pass
✅ No console warnings/errors
✅ Performance: no lag when sorting/filtering
