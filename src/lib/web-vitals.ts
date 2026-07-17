import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'
import type { Metric } from 'web-vitals'
import { usePostHog } from '@posthog/react'
import { EVENTS, captureWebVital } from './posthog-events.ts'

/**
 * Performance budget targets for Core Web Vitals.
 * These represent the "Good" threshold per Google's Core Web Vitals guidelines.
 */
export const PERFORMANCE_BUDGETS = {
  lcp: 2500, // Largest Contentful Paint: < 2.5s (Good)
  inp: 200, // Interaction to Next Paint: < 200ms (Good)
  cls: 0.1, // Cumulative Layout Shift: < 0.1 (Good)
  ttfb: 600, // Time to First Byte: < 600ms (Good)
  fcp: 1800, // First Contentful Paint: < 1.8s (Good)
} as const

/**
 * Initialize web vitals monitoring.
 * Captures Core Web Vitals metrics and sends them to PostHog.
 *
 * @param posthog - PostHog instance from usePostHog hook
 *
 * @example
 * useEffect(() => {
 *   const posthog = usePostHog()
 *   initWebVitals(posthog)
 * }, [])
 */
export function initWebVitals(posthog: ReturnType<typeof usePostHog> | null): void {
  if (!posthog) return

  /**
   * Largest Contentful Paint (LCP): measures loading performance.
   * Specifically, it marks the time at which the largest image or text block
   * is painted by the browser.
   */
  onLCP((metric: Metric) => {
    captureWebVital(posthog, EVENTS.WEB_VITAL_LCP, metric.value, metric.rating || 'unknown', metric.delta)
  })

  /**
   * Interaction to Next Paint (INP): measures interactivity.
   * It quantifies the experience users feel when trying to interact with
   * an unresponsive page — a low INP helps ensure the page is usable.
   * Note: INP replaces First Input Delay (FID) in the Core Web Vitals.
   */
  onINP((metric: Metric) => {
    captureWebVital(posthog, EVENTS.WEB_VITAL_FID, metric.value, metric.rating || 'unknown', metric.delta)
  })

  /**
   * Cumulative Layout Shift (CLS): measures visual stability.
   * It quantifies how much visible elements shift around on the page during
   * the page's lifetime — low CLS helps ensure visual stability.
   */
  onCLS((metric: Metric) => {
    captureWebVital(posthog, EVENTS.WEB_VITAL_CLS, metric.value, metric.rating || 'unknown', metric.delta)
  })

  /**
   * Time to First Byte (TTFB): measures server responsiveness.
   * It measures the time between the request for a resource and when
   * the first byte of a response begins arriving.
   */
  onTTFB((metric: Metric) => {
    captureWebVital(posthog, EVENTS.WEB_VITAL_TTFB, metric.value, metric.rating || 'unknown', metric.delta)
  })

  /**
   * First Contentful Paint (FCP): measures perceived load speed.
   * It marks the time at which the first text or image is painted.
   */
  onFCP((metric: Metric) => {
    captureWebVital(posthog, EVENTS.WEB_VITAL_FCP, metric.value, metric.rating || 'unknown', metric.delta)
  })
}

/**
 * Check if a metric value meets the performance budget.
 *
 * @param metric - The metric name (e.g., 'lcp', 'fid', 'cls')
 * @param value - The measured value
 * @returns true if the metric is within budget (Good)
 */
export function isWithinBudget(metric: keyof typeof PERFORMANCE_BUDGETS, value: number): boolean {
  return value <= PERFORMANCE_BUDGETS[metric]
}

/**
 * Format a metric value for display.
 *
 * @param metric - The metric name
 * @param value - The measured value
 * @returns Formatted string with appropriate units
 */
export function formatMetricValue(metric: keyof typeof PERFORMANCE_BUDGETS, value: number): string {
  const unit = metric === 'cls' ? '' : 'ms'
  const rounded = metric === 'cls' ? value.toFixed(3) : Math.round(value)
  return `${rounded}${unit}`
}

/**
 * Get the rating description for a web vital metric.
 *
 * @param metric - The metric name
 * @param value - The measured value
 * @returns Rating: 'good', 'needs-improvement', or 'poor'
 */
export function getMetricRating(
  metric: keyof typeof PERFORMANCE_BUDGETS,
  value: number,
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<keyof typeof PERFORMANCE_BUDGETS, { poor: number; good: number }> = {
    lcp: { poor: 4000, good: 2500 },
    inp: { poor: 500, good: 200 },
    cls: { poor: 0.25, good: 0.1 },
    ttfb: { poor: 1000, good: 600 },
    fcp: { poor: 3000, good: 1800 },
  }

  const threshold = thresholds[metric]
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}
