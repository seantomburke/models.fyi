/**
 * Performance budget definitions for models.wtf
 * These thresholds help maintain fast, responsive user experience
 */

export const PERFORMANCE_BUDGET = {
  // Bundle size budgets (in KB, minified + gzipped)
  bundles: {
    mainBundle: {
      label: 'Main application bundle (index)',
      maxSize: 200, // KB gzipped
      threshold: 180, // KB - warn if over this
    },
    compareBundle: {
      label: 'Compare page bundle',
      maxSize: 150, // KB gzipped
      threshold: 135,
    },
    graphBundle: {
      label: 'Graph page bundle',
      maxSize: 120, // KB gzipped
      threshold: 108,
    },
    calculatorBundle: {
      label: 'Calculator page bundle',
      maxSize: 100, // KB gzipped
      threshold: 90,
    },
  },

  // Web Vitals targets (Core Web Vitals)
  webVitals: {
    lcp: {
      name: 'Largest Contentful Paint',
      maxDuration: 2500, // ms
      good: 2500,
      needsImprovement: 4000,
    },
    inp: {
      name: 'Interaction to Next Paint',
      maxDuration: 200, // ms
      good: 200,
      needsImprovement: 500,
    },
    cls: {
      name: 'Cumulative Layout Shift',
      maxValue: 0.1, // unitless
      good: 0.1,
      needsImprovement: 0.25,
    },
  },

  // Additional timing targets
  timings: {
    ttfb: {
      name: 'Time to First Byte',
      maxDuration: 600, // ms
      good: 600,
      needsImprovement: 1800,
    },
    fcp: {
      name: 'First Contentful Paint',
      maxDuration: 1800, // ms
      good: 1800,
      needsImprovement: 3000,
    },
  },

  // Code splitting recommendations
  codeSplitting: {
    maxChunkSize: 500, // KB minified
    recommendedChunkSize: 250, // KB minified
  },
}

/**
 * Helper to check if bundle size is within budget
 */
export function checkBundleSize(
  bundleName: keyof typeof PERFORMANCE_BUDGET.bundles,
  actualSizeKb: number
): { ok: boolean; message: string } {
  const budget = PERFORMANCE_BUDGET.bundles[bundleName]
  if (actualSizeKb > budget.maxSize) {
    return {
      ok: false,
      message: `❌ ${budget.label}: ${actualSizeKb.toFixed(1)}KB exceeds max ${budget.maxSize}KB`,
    }
  }
  if (actualSizeKb > budget.threshold) {
    return {
      ok: true,
      message: `⚠️  ${budget.label}: ${actualSizeKb.toFixed(1)}KB is close to max (${budget.maxSize}KB)`,
    }
  }
  return {
    ok: true,
    message: `✓ ${budget.label}: ${actualSizeKb.toFixed(1)}KB`,
  }
}

/**
 * Helper to check if web vital is acceptable
 */
export function checkWebVital(
  metric: 'lcp' | 'inp' | 'cls',
  value: number
): { ok: boolean; message: string } {
  const vital = PERFORMANCE_BUDGET.webVitals[metric]
  if (metric === 'cls') {
    const clsVital = vital as { name: string; maxValue: number; good: number; needsImprovement: number }
    if (value > clsVital.needsImprovement) {
      return {
        ok: false,
        message: `❌ ${clsVital.name}: ${value.toFixed(3)} exceeds acceptable (${clsVital.maxValue})`,
      }
    }
    if (value > clsVital.good) {
      return {
        ok: true,
        message: `⚠️  ${clsVital.name}: ${value.toFixed(3)} is above target (${clsVital.good})`,
      }
    }
    return {
      ok: true,
      message: `✓ ${clsVital.name}: ${value.toFixed(3)}`,
    }
  }

  // For LCP and INP (milliseconds)
  const durationVital = vital as { name: string; maxDuration: number; good: number; needsImprovement: number }
  if (value > durationVital.needsImprovement) {
    return {
      ok: false,
      message: `❌ ${durationVital.name}: ${value.toFixed(0)}ms exceeds acceptable (${durationVital.maxDuration}ms)`,
    }
  }
  if (value > durationVital.maxDuration) {
    return {
      ok: true,
      message: `⚠️  ${durationVital.name}: ${value.toFixed(0)}ms is above target (${durationVital.good}ms)`,
    }
  }
  return {
    ok: true,
    message: `✓ ${durationVital.name}: ${value.toFixed(0)}ms`,
  }
}
