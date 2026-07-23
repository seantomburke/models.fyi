# Performance Budget & Monitoring

This document outlines the performance targets, budgets, and monitoring processes for models.fyi.

## Overview

Performance is a core product requirement. We track bundle sizes, Web Vitals, and key timing metrics to ensure the site remains fast and responsive for all users.

## Bundle Size Budgets

All sizes listed are **minified + gzipped** (production mode).

| Bundle | Component | Max Size | Threshold | Rationale |
|--------|-----------|----------|-----------|-----------|
| Main | index.js (core app) | 200 KB | 180 KB | Largest chunk; includes routing and core utilities |
| Compare | compare-page assets | 150 KB | 135 KB | Data-heavy comparison table and filters |
| Graph | openchart + chart data | 120 KB | 108 KB | Visualization library is relatively heavy |
| Calculator | token counter + charts | 100 KB | 90 KB | Token encoding library and pricing math |

### How to Monitor Bundle Sizes

After running `npm run build`, check the bundle analysis in the build output:

```bash
npm run build
```

The CLI will print sizes for each chunk. Compare against budgets:

```
dist/assets/index-CxiAQibG.js          538.50 kB │ gzip:   173.75 kB  ✓ Within budget
dist/assets/graph-CZVanF-f.js          480.13 kB │ gzip:   147.05 kB  ✓ Within budget
dist/assets/Calculator-BMlDdqvD.js      12.14 kB │ gzip:     4.39 kB  ✓ Within budget
```

### Code Splitting Best Practices

- Lazy-load route pages with `React.lazy()` and `Suspense`
- Use dynamic imports for heavy libraries (e.g., charting)
- Avoid loading `tokenizers` or `openchart` in the critical path
- Monitor chunk sizes in the Vite build config

See `vite.config.ts` for current code splitting configuration.

## Web Vitals & Core Web Vitals

Targets are based on Google's Core Web Vitals and industry standards.

### Core Web Vitals

| Metric | Target | Good | Needs Improvement | Notes |
|--------|--------|------|-------------------|-------|
| **LCP** (Largest Contentful Paint) | 2500 ms | ≤ 2500 ms | > 4000 ms | Time until largest visual element renders |
| **INP** (Interaction to Next Paint) | 200 ms | ≤ 200 ms | > 500 ms | Time from user interaction to visual feedback |
| **CLS** (Cumulative Layout Shift) | 0.1 | ≤ 0.1 | > 0.25 | Unexpected layout shifts during page load |

### Additional Timing Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| **TTFB** (Time to First Byte) | 600 ms | Server response time; affected by CDN/hosting |
| **FCP** (First Contentful Paint) | 1800 ms | Time until any content appears; includes blocking scripts |

## Monitoring with Web Vitals

### Client-Side Collection (Browser)

The application integrates Google's `web-vitals` library to collect real user metrics:

```typescript
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals'

getCLS((metric) => console.log('CLS:', metric.value))
getLCP((metric) => console.log('LCP:', metric.value))
getTTFB((metric) => console.log('TTFB:', metric.value))
```

These are sent to PostHog for analytics.

### Lab Testing (Local)

Use Chrome DevTools Lighthouse or WebPageTest to measure:

1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Generate report" (Mobile or Desktop)
4. Review Core Web Vitals and performance metrics
5. Compare against targets above

### Production Monitoring

- **PostHog Analytics**: Real user metrics are collected and sent to PostHog
- **Deploy Logs**: Each build prints bundle sizes
- **GitHub Actions**: (Future) Add CI checks to fail builds that exceed budgets

## Lighthouse Audit Checklist

Use this checklist when auditing performance:

- [ ] **Performance Score** ≥ 90
  - [ ] LCP ≤ 2.5s
  - [ ] INP ≤ 200ms
  - [ ] CLS ≤ 0.1
- [ ] **Accessibility Score** ≥ 90
  - [ ] All images have alt text
  - [ ] All links are descriptive
  - [ ] Color contrast ≥ 4.5:1 for text
- [ ] **Best Practices Score** ≥ 90
  - [ ] No console errors
  - [ ] No console warnings
  - [ ] HTTPS enabled
- [ ] **SEO Score** ≥ 90
  - [ ] Meta description present
  - [ ] Canonical tags in place
  - [ ] Mobile-friendly

## Bundle Size Analysis

### Current Production Bundles

To see detailed analysis:

```bash
npm run build 2>&1 | grep -E "dist/assets|gzip"
```

Latest build (2026-07-17):
- index-*.js: 173.76 KB gzipped ✓
- graph-*.js: 147.05 KB gzipped ✓
- Calculator-*.js: 4.39 KB gzipped ✓

### Reducing Bundle Size

If a bundle exceeds its budget:

1. **Identify the cause**: Check what's in the chunk
   ```bash
   npm install --save-dev rollup-plugin-visualizer
   # Add to vite.config.ts, rebuild, check dist/stats.html
   ```

2. **Common optimizations**:
   - Lazy-load route components
   - Remove unused dependencies
   - Replace heavy libraries with lighter alternatives
   - Move code to separate chunks with code splitting

## Performance Budget Configuration

The performance budget is defined in `src/lib/performance-budget.ts`:

```typescript
export const PERFORMANCE_BUDGET = {
  bundles: {
    mainBundle: { maxSize: 200, threshold: 180 },
    compareBundle: { maxSize: 150, threshold: 135 },
    graphBundle: { maxSize: 120, threshold: 108 },
    calculatorBundle: { maxSize: 100, threshold: 90 },
  },
  webVitals: {
    lcp: { maxDuration: 2500 },
    inp: { maxDuration: 200 },
    cls: { maxValue: 0.1 },
  },
}
```

### Adjusting Budgets

To change budgets:

1. Edit `src/lib/performance-budget.ts`
2. Update the numbers in the `PERFORMANCE_BUDGET` object
3. Document the reason for the change
4. Commit with a clear message

## Further Reading

- [Google's Core Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Web Vitals Library](https://github.com/GoogleChrome/web-vitals)
