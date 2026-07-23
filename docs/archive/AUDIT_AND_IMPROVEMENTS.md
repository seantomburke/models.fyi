# Models.fyi Audit and Improvements Plan

## Current State
The website is a React + Vite SPA that helps users select AI models. It includes:
- Home page with navigation to other sections
- Compare page (table of models and benchmarks)
- Graph page (interactive scatter plot)
- Calculator page (token cost calculator)
- Quiz page (decision flow for recommendations)
- Learn section (educational content)
- Error boundary, dark mode, mobile nav, 404 page
- PostHog analytics integration
- Static data (hardcoded models and benchmarks)
- GitHub Pages deployment with prerendering and sitemap generation

## Audit Findings & Improvement Opportunities

### 1. **Performance & Bundle Size**
**Current:** Lazy-loading Graph and Calculator to keep main bundle small
**Opportunity:** 
- Add performance monitoring (Web Vitals)
- Profile bundle sizes with `vite-plugin-visualizer`
- Consider lazy-loading Learn pages
- Add preload hints for critical resources

### 2. **SEO & Discoverability**
**Current:** Basic meta tags, semantic HTML, sitemap generation
**Opportunity:**
- Add structured data (JSON-LD) for models, FAQs, breadcrumbs
- Enhance meta descriptions per page
- Add Open Graph and Twitter Card tags
- Improve internal linking strategy
- Add FAQ schema for Learn section

### 3. **User Experience**
**Current:** Dark mode toggle, mobile nav, error boundary
**Opportunity:**
- Add print styles for Compare table (users may want to print comparisons)
- Improve table sorting/filtering UX on Compare page
- Add export functionality (CSV) for Compare table data
- Add breadcrumb navigation
- Implement keyboard shortcuts for power users
- Add tooltips/help text for benchmark explanations

### 4. **Accessibility**
**Current:** Semantic HTML, ARIA labels
**Opportunity:**
- Audit color contrast ratios
- Add ARIA live regions for dynamic content
- Improve focus management in modals/panels
- Test with screen readers
- Add skip-to-content link
- Ensure keyboard navigation works everywhere

### 5. **Data Quality & Freshness**
**Current:** Data refreshed manually, notes about sources
**Opportunity:**
- Add "last updated" timestamp visibility
- Add data validation tests
- Show confidence levels for scores
- Link to source benchmarks for each score
- Add flags for newly released models
- Consider data versioning/changelog

### 6. **Code Quality & Maintainability**
**Current:** TypeScript, tests, linting (oxlint)
**Opportunity:**
- Add pre-commit hooks (husky)
- Add GitHub Actions for CI/CD beyond just build
- Improve test coverage metrics
- Add E2E tests (Playwright)
- Add component documentation (Storybook)
- Standardize commit message format

### 7. **Mobile Experience**
**Current:** Responsive design, mobile nav
**Opportunity:**
- Test on real devices
- Optimize touch targets (min 44px)
- Reduce horizontal scrolling
- Improve table readability on small screens
- Consider mobile-first redesign of Compare table
- Add app metadata for PWA potential

### 8. **Analytics & Tracking**
**Current:** PostHog integration
**Opportunity:**
- Track benchmark clicks and expansions
- Track which filters are most used in Compare
- Track Quiz completion rate and recommendations given
- Track Learn section engagement
- Monitor page scroll depth
- Add goals/funnels (e.g., "user found right model")

### 9. **Learning Content**
**Current:** Topics in Learn section
**Opportunity:**
- Expand Learn section with more model types (vision, audio, embeddings)
- Add video explanations (can embed YouTube)
- Add interactive demos
- Add glossary/index of terms
- Add "Compare with similar model" quick links
- Link from models to related learn topics

### 10. **Graph Page Enhancements**
**Current:** Scatter plot with axis selection
**Opportunity:**
- Add trendlines/regression lines
- Add region highlighting (e.g., "best value")
- Save/share graph configurations
- Add historical trend view
- Hover state improvements
- Add legend toggling per provider

### 11. **Calculator Page**
**Current:** Token cost calculator
**Opportunity:**
- Compare cost across multiple models at once
- Add bulk request calculators
- Add ROI calculator (cost vs accuracy)
- Save calculator presets
- Add API pricing breakdowns

### 12. **Progressive Enhancement**
**Current:** React SPA
**Opportunity:**
- Add meta tags for critical pages
- Improve first contentful paint
- Add skeleton loaders (already done for Graph/Calculator)
- Consider partial hydration
- Add offline support via Service Worker
- Cache benchmark data locally

---

## Priority Tiers

### High Impact, Low Effort
1. ✅ Add JSON-LD structured data
2. ✅ Enhance meta descriptions and OG tags
3. ✅ Add "last updated" timestamp
4. ✅ Add print styles for Compare table
5. ✅ Add CSV export for Compare table

### High Impact, Medium Effort
1. Performance monitoring (Web Vitals)
2. Table sorting/filtering UI improvements
3. E2E tests
4. Pre-commit hooks & CI/CD

### Medium Impact, Medium Effort
1. Accessibility audit and fixes
2. Learn content expansion
3. Graph page enhancements
4. Analytics enhancements

### Nice to Have
1. Storybook for components
2. PWA support
3. Interactive demos in Learn
4. Video explanations

---

## Implementation Order

This plan will be executed in phases:

1. **Phase 1 (SEO & Metadata):** Structured data, OG tags, last updated timestamps
2. **Phase 2 (User Experience):** Print styles, CSV export, table sorting improvements
3. **Phase 3 (Performance):** Web Vitals monitoring, bundle visualization
4. **Phase 4 (Accessibility & Testing):** Accessibility audit, E2E tests
5. **Phase 5 (Content & Analytics):** Analytics enhancements, Learn content

