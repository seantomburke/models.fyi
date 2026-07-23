# Website Improvements Implementation Plan

> **Status:** DRAFT

## Specification

**Problem:** The website is functionally complete but lacks several polish features that improve reliability, usability, and discoverability:

1. No error handling for component crashes (users see blank pages)
2. Mobile navigation breaks with long nav bar (horizontal scroll on small screens)
3. 404 page is generic with no helpful links
4. No dark mode support (increasingly expected feature)
5. Lazy-loaded pages show plain "Loading..." text (slow perceived performance)
6. No sitemap.xml for search engine crawling (SEO requirement not fully met)

**Goal:** A more robust, polished website with better mobile UX, graceful error handling, dark mode, and improved SEO. All tests pass, no regressions.

**Scope:**

**In:**
- Error Boundary component to catch and display component errors gracefully
- Mobile-responsive navigation with hamburger menu
- Enhanced 404 page with suggested links
- Dark mode toggle in header with localStorage persistence
- Skeleton loaders for lazy-loaded pages (Graph, Calculator)
- Static sitemap.xml generation at build time

**Out:**
- Server-side error logging/monitoring (keep client-side only)
- Advanced analytics beyond PostHog already integrated
- Accessibility audits beyond semantic HTML already in place

**Success Criteria:**

- [ ] Error Boundary catches React errors and displays fallback UI
- [ ] Navigation is responsive on mobile with hamburger menu
- [ ] 404 page shows helpful links to main pages
- [ ] Dark mode toggle in header, preference persists across sessions
- [ ] Skeleton loaders visible while Graph and Calculator load
- [ ] `sitemap.xml` auto-generated at build time, discoverable at `/models.fyi/sitemap.xml`
- [ ] All existing tests pass (69 tests)
- [ ] New tests added for Error Boundary and dark mode hook
- [ ] No breaking changes to existing component APIs

## Context Loading

_Run before starting:_

```bash
read src/App.tsx src/components/Layout.tsx src/pages/Placeholder.tsx
read src/lib/meta.ts vite.config.ts package.json
ls -la src/pages/
```

## Tasks

## Foundation: Error Handling & Dark Mode

### Task 1: Error Boundary Component

**Context:** `src/components/`, `src/App.tsx`, error handling

**Steps:**

1. [ ] Create `src/components/ErrorBoundary.tsx` that:
   - Catches React errors with `getDerivedStateFromError` and `componentDidCatch`
   - Displays a friendly error message with icon and text
   - Shows "Try again" button that reloads the page
   - Logs error to console in development
   - Includes basic styling (matches existing design system)

2. [ ] Create `src/components/ErrorBoundary.test.tsx` testing:
   - Error is caught and fallback UI is shown
   - "Try again" button reloads page
   - Normal children render when no error

3. [ ] Wrap the entire app in `src/App.tsx`:
   - Import ErrorBoundary
   - Wrap `<Routes>` in `<ErrorBoundary>`

4. [ ] Run tests: `npm test`

**Verify:** `npm test -- ErrorBoundary && npm run lint`

---

### Task 2: Dark Mode Hook & Toggle Component

**Context:** `src/components/Layout.tsx`, `src/lib/`

**Steps:**

1. [ ] Create `src/lib/darkMode.ts` hook:
   - `useDarkMode()` hook that:
     - Reads initial preference from localStorage (key: `models-fyi-dark-mode`)
     - Falls back to system preference via `window.matchMedia('(prefers-color-scheme: dark)')`
     - Returns `[isDark: boolean, setIsDark: (v: boolean) => void]`
     - Applies `dark` class to document root
     - Persists preference to localStorage on change

2. [ ] Create `src/components/DarkModeToggle.tsx`:
   - Simple button with sun/moon icon
   - Uses `useDarkMode()` hook
   - Toggles dark mode on click
   - 20px icon, positioned in header

3. [ ] Create `src/lib/darkMode.test.ts`:
   - Test initial state from localStorage
   - Test fallback to system preference
   - Test localStorage persistence
   - Test document root class application

4. [ ] Update `src/components/Layout.tsx`:
   - Import `DarkModeToggle`
   - Add toggle button to header (right side, before logo)
   - Adjust nav flex layout if needed

5. [ ] Run tests: `npm test`

**Verify:** `npm test -- darkMode && npm run lint && npm run build`

---

## UI Improvements

### Task 3: Mobile Navigation with Hamburger Menu

**Context:** `src/components/Layout.tsx`, responsive design

**Steps:**

1. [ ] Update `src/components/Layout.tsx`:
   - Add `useState` for mobile menu open/close
   - Create `<MobileNav>` component inside Layout that:
     - Shows hamburger button (3 lines icon) only on mobile (`sm:hidden`)
     - Toggles visibility of nav items on small screens
     - Renders as a dropdown or overlay menu
     - Closes menu on nav item click
   - Desktop nav remains unchanged (shown with `hidden sm:flex`)
   - Mobile nav items stack vertically
   - Use Tailwind classes for responsive behavior

2. [ ] Update styling:
   - Hamburger button: 44x44 clickable area (accessible)
   - Mobile nav menu: full-width dropdown below header
   - Apply dark mode colors to menu

3. [ ] No new test file needed (small component, tested visually)

4. [ ] Verify responsive behavior at 375px width

**Verify:** `npm run dev` and test at mobile width (DevTools device emulation)

---

### Task 4: Enhanced 404 Page

**Context:** `src/pages/Placeholder.tsx`, `src/App.tsx`

**Steps:**

1. [ ] Create `src/pages/NotFound.tsx`:
   - Remove generic Placeholder usage
   - Create dedicated NotFound page component
   - Display:
     - Large heading: "Page not found"
     - Friendly message: "The page you're looking for doesn't exist."
     - Grid of helpful links to main pages:
       - Home
       - Quiz (with "Which model should I use?")
       - Compare
       - Graph
       - Calculator
       - Learn
     - Each link shows title + description
   - Use same card design as Home page for consistency
   - Include meta tags via `usePageMeta`

2. [ ] Create `src/pages/NotFound.test.tsx`:
   - Test that page renders
   - Test that all main page links are present

3. [ ] Update `src/App.tsx`:
   - Replace catch-all Placeholder route with `<NotFound />`

4. [ ] Run tests: `npm test`

**Verify:** `npm test -- NotFound && npm run lint`

---

### Task 5: Loading Skeleton Components

**Context:** `src/components/`, suspension/loading states

**Steps:**

1. [ ] Create `src/components/SkeletonLoader.tsx`:
   - Simple reusable skeleton component
   - Takes optional `className`, `lines` prop for text height
   - Default: 200px height gray pulse animation
   - Uses Tailwind `animate-pulse` class

2. [ ] Create `src/components/GraphSkeleton.tsx`:
   - Placeholder matching Graph page layout
   - Renders skeleton boxes for title, controls, chart area
   - Height ~500px

3. [ ] Create `src/components/CalculatorSkeleton.tsx`:
   - Placeholder matching Calculator page layout
   - Skeleton for title, input fields, results area
   - Height ~600px

4. [ ] Update `src/App.tsx` Suspense fallbacks:
   - Replace `<p>Loading graph…</p>` with `<GraphSkeleton />`
   - Replace `<p>Loading calculator…</p>` with `<CalculatorSkeleton />`

5. [ ] Create `src/components/SkeletonLoader.test.tsx`:
   - Test component renders
   - Test className prop is applied

6. [ ] Run tests: `npm test`

**Verify:** `npm test -- Skeleton && npm run lint`

---

## SEO & Build

### Task 6: Sitemap Generation

**Context:** `vite.config.ts`, build scripts, `src/lib/routeMeta.ts`

**Steps:**

1. [ ] Create `scripts/generate-sitemap.mjs`:
   - Generates XML sitemap for all known routes
   - Routes to include (hardcoded for static site):
     - `/` (home)
     - `/compare`
     - `/graph`
     - `/calculator`
     - `/quiz`
     - `/learn`
     - `/learn/:slug` for each Learn topic (read from `src/pages/learn/topics.ts`)
   - Set lastmod to build date
   - Include changefreq (weekly for home, monthly for subpages)
   - Write to `dist/sitemap.xml`

2. [ ] Update `package.json` build script:
   - After vite builds, run `node scripts/generate-sitemap.mjs`
   - Current: `"build": "tsc -b && vite build && vite build --ssr ... && node scripts/prerender.mjs"`
   - New: `"build": "tsc -b && vite build && vite build --ssr ... && node scripts/prerender.mjs && node scripts/generate-sitemap.mjs"`

3. [ ] Create `src/robots.txt` (static asset):
   - Standard robots.txt pointing to sitemap
   - Allow all crawlers
   - Copy to public/ so it ends up in dist/

4. [ ] Add public/robots.txt:
   ```
   User-agent: *
   Allow: /

   Sitemap: https://models.fyi/models.fyi/sitemap.xml
   ```

5. [ ] Verify in production build:
   - `npm run build`
   - Check `dist/sitemap.xml` exists
   - Check `dist/robots.txt` exists

**Verify:** `npm run build && test -f dist/sitemap.xml && cat dist/sitemap.xml | head -20`

---

## Verification & QA

### Task 7: Integration Testing & Verification

**Context:** All components, full app

**Steps:**

1. [ ] Run full test suite:
   - `npm test` → All 69 tests pass + any new tests

2. [ ] Build and preview:
   - `npm run build`
   - `npm run preview`
   - Check for no errors/warnings

3. [ ] Manual verification checklist:
   - [ ] Error page (throw error in console or trigger error boundary)
   - [ ] Dark mode toggle appears in header
   - [ ] Dark mode toggle switches theme
   - [ ] Dark mode preference persists after refresh
   - [ ] Mobile nav hamburger appears at mobile width (375px)
   - [ ] Mobile nav menu opens/closes on hamburger click
   - [ ] Mobile nav closes when a nav item is clicked
   - [ ] 404 page shows when navigating to `/invalid-page`
   - [ ] 404 page has helpful links
   - [ ] Graph page shows skeleton while loading
   - [ ] Calculator page shows skeleton while loading
   - [ ] Sitemap is valid XML
   - [ ] All routes appear in sitemap

4. [ ] Lint & type check:
   - `npm run lint`
   - `npx tsc --noEmit`

**Verify:** `npm test && npm run build && npm run lint`

---

## Notes

- Error Boundary, Dark Mode Hook, and Skeleton Loaders are independent and can be parallelized
- Mobile Navigation and NotFound page modifications are UI-only and can run in parallel
- Sitemap generation depends only on the build script, independent of other tasks
- All tasks include comprehensive testing
- No breaking changes; all existing component APIs remain unchanged
