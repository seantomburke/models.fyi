import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  PERFORMANCE_BUDGETS,
  initWebVitals,
  isWithinBudget,
  formatMetricValue,
  getMetricRating,
} from './web-vitals.ts'

// Mock web-vitals functions
vi.mock('web-vitals', () => ({
  onCLS: vi.fn(),
  onFCP: vi.fn(),
  onINP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
}))

// Mock posthog-events functions
vi.mock('./posthog-events.ts', () => ({
  EVENTS: {
    WEB_VITAL_LCP: 'web_vital_lcp',
    WEB_VITAL_FID: 'web_vital_fid',
    WEB_VITAL_CLS: 'web_vital_cls',
    WEB_VITAL_TTFB: 'web_vital_ttfb',
    WEB_VITAL_FCP: 'web_vital_fcp',
  },
  captureWebVital: vi.fn(),
}))

describe('PERFORMANCE_BUDGETS', () => {
  it('should have all required budgets defined', () => {
    expect(PERFORMANCE_BUDGETS.lcp).toBe(2500)
    expect(PERFORMANCE_BUDGETS.inp).toBe(200)
    expect(PERFORMANCE_BUDGETS.cls).toBe(0.1)
    expect(PERFORMANCE_BUDGETS.ttfb).toBe(600)
    expect(PERFORMANCE_BUDGETS.fcp).toBe(1800)
  })

  it('should define Good thresholds per Google Core Web Vitals guidelines', () => {
    // LCP: < 2.5s
    expect(PERFORMANCE_BUDGETS.lcp).toBeLessThanOrEqual(2500)
    // INP: < 200ms (replaced FID)
    expect(PERFORMANCE_BUDGETS.inp).toBeLessThanOrEqual(200)
    // CLS: < 0.1
    expect(PERFORMANCE_BUDGETS.cls).toBeLessThanOrEqual(0.1)
    // TTFB: < 600ms
    expect(PERFORMANCE_BUDGETS.ttfb).toBeLessThanOrEqual(600)
    // FCP: < 1.8s
    expect(PERFORMANCE_BUDGETS.fcp).toBeLessThanOrEqual(1800)
  })
})

describe('initWebVitals', () => {
  let mockPostHog: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockPostHog = {
      capture: vi.fn(),
    }
  })

  it('should handle null posthog gracefully', () => {
    expect(() => {
      initWebVitals(null)
    }).not.toThrow()
  })

  it('should handle undefined posthog gracefully', () => {
    expect(() => {
      initWebVitals(undefined as any)
    }).not.toThrow()
  })

  it('should register callbacks for all web vitals', async () => {
    const { onLCP, onINP, onCLS, onTTFB, onFCP } = await import('web-vitals')

    initWebVitals(mockPostHog)

    expect(onLCP).toHaveBeenCalled()
    expect(onINP).toHaveBeenCalled()
    expect(onCLS).toHaveBeenCalled()
    expect(onTTFB).toHaveBeenCalled()
    expect(onFCP).toHaveBeenCalled()
  })
})

describe('isWithinBudget', () => {
  it('should return true for LCP within budget', () => {
    expect(isWithinBudget('lcp', 2000)).toBe(true)
    expect(isWithinBudget('lcp', 2500)).toBe(true)
  })

  it('should return false for LCP exceeding budget', () => {
    expect(isWithinBudget('lcp', 2501)).toBe(false)
    expect(isWithinBudget('lcp', 4000)).toBe(false)
  })

  it('should return true for INP within budget', () => {
    expect(isWithinBudget('inp', 50)).toBe(true)
    expect(isWithinBudget('inp', 200)).toBe(true)
  })

  it('should return false for INP exceeding budget', () => {
    expect(isWithinBudget('inp', 201)).toBe(false)
    expect(isWithinBudget('inp', 500)).toBe(false)
  })

  it('should return true for CLS within budget', () => {
    expect(isWithinBudget('cls', 0.05)).toBe(true)
    expect(isWithinBudget('cls', 0.1)).toBe(true)
  })

  it('should return false for CLS exceeding budget', () => {
    expect(isWithinBudget('cls', 0.101)).toBe(false)
    expect(isWithinBudget('cls', 0.25)).toBe(false)
  })

  it('should return true for TTFB within budget', () => {
    expect(isWithinBudget('ttfb', 400)).toBe(true)
    expect(isWithinBudget('ttfb', 600)).toBe(true)
  })

  it('should return false for TTFB exceeding budget', () => {
    expect(isWithinBudget('ttfb', 601)).toBe(false)
    expect(isWithinBudget('ttfb', 1000)).toBe(false)
  })

  it('should return true for FCP within budget', () => {
    expect(isWithinBudget('fcp', 1200)).toBe(true)
    expect(isWithinBudget('fcp', 1800)).toBe(true)
  })

  it('should return false for FCP exceeding budget', () => {
    expect(isWithinBudget('fcp', 1801)).toBe(false)
    expect(isWithinBudget('fcp', 3000)).toBe(false)
  })
})

describe('formatMetricValue', () => {
  it('should format LCP with ms unit and rounded to nearest int', () => {
    expect(formatMetricValue('lcp', 1234.56)).toBe('1235ms')
    expect(formatMetricValue('lcp', 2000)).toBe('2000ms')
  })

  it('should format INP with ms unit and rounded to nearest int', () => {
    expect(formatMetricValue('inp', 45.7)).toBe('46ms')
    expect(formatMetricValue('inp', 200)).toBe('200ms')
  })

  it('should format CLS with 3 decimal places and no unit', () => {
    expect(formatMetricValue('cls', 0.05)).toBe('0.050')
    expect(formatMetricValue('cls', 0.123456)).toBe('0.123')
  })

  it('should format TTFB with ms unit and rounded to nearest int', () => {
    expect(formatMetricValue('ttfb', 450.3)).toBe('450ms')
    expect(formatMetricValue('ttfb', 600)).toBe('600ms')
  })

  it('should format FCP with ms unit and rounded to nearest int', () => {
    expect(formatMetricValue('fcp', 1500.8)).toBe('1501ms')
    expect(formatMetricValue('fcp', 1800)).toBe('1800ms')
  })
})

describe('getMetricRating', () => {
  describe('LCP ratings', () => {
    it('should rate good LCP as "good"', () => {
      expect(getMetricRating('lcp', 1500)).toBe('good')
      expect(getMetricRating('lcp', 2500)).toBe('good')
    })

    it('should rate moderate LCP as "needs-improvement"', () => {
      expect(getMetricRating('lcp', 3000)).toBe('needs-improvement')
      expect(getMetricRating('lcp', 4000)).toBe('needs-improvement')
    })

    it('should rate poor LCP as "poor"', () => {
      expect(getMetricRating('lcp', 4001)).toBe('poor')
      expect(getMetricRating('lcp', 5000)).toBe('poor')
    })
  })

  describe('INP ratings', () => {
    it('should rate good INP as "good"', () => {
      expect(getMetricRating('inp', 50)).toBe('good')
      expect(getMetricRating('inp', 200)).toBe('good')
    })

    it('should rate moderate INP as "needs-improvement"', () => {
      expect(getMetricRating('inp', 250)).toBe('needs-improvement')
      expect(getMetricRating('inp', 500)).toBe('needs-improvement')
    })

    it('should rate poor INP as "poor"', () => {
      expect(getMetricRating('inp', 501)).toBe('poor')
      expect(getMetricRating('inp', 1000)).toBe('poor')
    })
  })

  describe('CLS ratings', () => {
    it('should rate good CLS as "good"', () => {
      expect(getMetricRating('cls', 0.05)).toBe('good')
      expect(getMetricRating('cls', 0.1)).toBe('good')
    })

    it('should rate moderate CLS as "needs-improvement"', () => {
      expect(getMetricRating('cls', 0.15)).toBe('needs-improvement')
      expect(getMetricRating('cls', 0.25)).toBe('needs-improvement')
    })

    it('should rate poor CLS as "poor"', () => {
      expect(getMetricRating('cls', 0.251)).toBe('poor')
      expect(getMetricRating('cls', 0.5)).toBe('poor')
    })
  })

  describe('TTFB ratings', () => {
    it('should rate good TTFB as "good"', () => {
      expect(getMetricRating('ttfb', 400)).toBe('good')
      expect(getMetricRating('ttfb', 600)).toBe('good')
    })

    it('should rate moderate TTFB as "needs-improvement"', () => {
      expect(getMetricRating('ttfb', 700)).toBe('needs-improvement')
      expect(getMetricRating('ttfb', 1000)).toBe('needs-improvement')
    })

    it('should rate poor TTFB as "poor"', () => {
      expect(getMetricRating('ttfb', 1001)).toBe('poor')
      expect(getMetricRating('ttfb', 2000)).toBe('poor')
    })
  })

  describe('FCP ratings', () => {
    it('should rate good FCP as "good"', () => {
      expect(getMetricRating('fcp', 1200)).toBe('good')
      expect(getMetricRating('fcp', 1800)).toBe('good')
    })

    it('should rate moderate FCP as "needs-improvement"', () => {
      expect(getMetricRating('fcp', 2000)).toBe('needs-improvement')
      expect(getMetricRating('fcp', 3000)).toBe('needs-improvement')
    })

    it('should rate poor FCP as "poor"', () => {
      expect(getMetricRating('fcp', 3001)).toBe('poor')
      expect(getMetricRating('fcp', 5000)).toBe('poor')
    })
  })
})
