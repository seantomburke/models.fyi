import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  EVENTS,
  captureFilterChange,
  captureFilterCleared,
  captureSortChange,
  captureExport,
  captureExportFailed,
  captureBenchmarkSourceClick,
  captureGraphAxesChange,
  captureGraphPointSelected,
  captureCalculatorTextEntered,
  captureCalculatorOutputChanged,
  captureCalculatorEffortChanged,
  captureCalculatorSortChanged,
  captureQuizStarted,
  captureQuizStepAnswered,
  captureQuizCompleted,
  captureQuizResultViewed,
  captureQuizReset,
  captureLearnTopicViewed,
  captureWebVital,
} from './posthog-events.ts'

// Mock PostHog instance
let mockPostHog: any

beforeEach(() => {
  mockPostHog = {
    capture: vi.fn(),
  }
})

describe('EVENTS', () => {
  it('should have all required event names defined', () => {
    expect(EVENTS.COMPARE_FILTER_CHANGED).toBe('compare_filter_changed')
    expect(EVENTS.COMPARE_TABLE_SORTED).toBe('compare_table_sorted')
    expect(EVENTS.GRAPH_AXES_CHANGED).toBe('graph_axes_changed')
    expect(EVENTS.CALCULATOR_TEXT_ENTERED).toBe('calculator_text_entered')
    expect(EVENTS.QUIZ_COMPLETED).toBe('quiz_completed')
    expect(EVENTS.WEB_VITAL_LCP).toBe('web_vital_lcp')
  })

  it('should have unique event names', () => {
    const values = Object.values(EVENTS)
    const uniqueValues = new Set(values)
    expect(uniqueValues.size).toBe(values.length)
  })
})

describe('Compare page events', () => {
  it('captureFilterChange should send correct event and properties', () => {
    captureFilterChange({ capture: mockPostHog.capture } as any, 'anthropic')
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.COMPARE_FILTER_CHANGED, {
      filter: 'anthropic',
    })
  })

  it('captureFilterCleared should send event with no properties', () => {
    captureFilterCleared({ capture: mockPostHog.capture } as any)
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.COMPARE_FILTER_CLEARED)
  })

  it('captureSortChange should send correct event and properties', () => {
    captureSortChange(
      { capture: mockPostHog.capture } as any,
      'inputPrice',
      'asc',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.COMPARE_TABLE_SORTED, {
      column: 'inputPrice',
      direction: 'asc',
    })
  })

  it('captureExport should send success event with model count', () => {
    captureExport({ capture: mockPostHog.capture } as any, 42)
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.COMPARE_TABLE_EXPORTED, {
      model_count: 42,
      success: true,
    })
  })

  it('captureExportFailed should send failure event with error message', () => {
    const error = 'Clipboard API not available'
    captureExportFailed({ capture: mockPostHog.capture } as any, 10, error)
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.COMPARE_TABLE_EXPORT_FAILED, {
      model_count: 10,
      error,
    })
  })

  it('captureBenchmarkSourceClick should send event with benchmark id', () => {
    captureBenchmarkSourceClick({ capture: mockPostHog.capture } as any, 'swe-bench-verified')
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.COMPARE_BENCHMARK_CLICKED, {
      benchmark_id: 'swe-bench-verified',
    })
  })
})

describe('Graph page events', () => {
  it('captureGraphAxesChange should send event for x-axis change', () => {
    captureGraphAxesChange(
      { capture: mockPostHog.capture } as any,
      'x',
      'price-input',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.GRAPH_AXES_CHANGED, {
      axis: 'x',
      axis_id: 'price-input',
    })
  })

  it('captureGraphAxesChange should send event for y-axis change', () => {
    captureGraphAxesChange(
      { capture: mockPostHog.capture } as any,
      'y',
      'swe-bench-verified',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.GRAPH_AXES_CHANGED, {
      axis: 'y',
      axis_id: 'swe-bench-verified',
    })
  })

  it('captureGraphPointSelected should send event with model and axis values', () => {
    captureGraphPointSelected(
      { capture: mockPostHog.capture } as any,
      'Claude 3.5 Sonnet',
      'Anthropic',
      0.003,
      92.3,
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.GRAPH_POINT_SELECTED, {
      model: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      x: 0.003,
      y: 92.3,
    })
  })
})

describe('Calculator page events', () => {
  it('captureCalculatorTextEntered should send event for input field', () => {
    captureCalculatorTextEntered(
      { capture: mockPostHog.capture } as any,
      'input',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.CALCULATOR_TEXT_ENTERED, {
      field: 'input',
    })
  })

  it('captureCalculatorOutputChanged should send event with no properties', () => {
    captureCalculatorOutputChanged({ capture: mockPostHog.capture } as any)
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.CALCULATOR_OUTPUT_CHANGED)
  })

  it('captureCalculatorEffortChanged should send event with effort value', () => {
    captureCalculatorEffortChanged(
      { capture: mockPostHog.capture } as any,
      'high',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.CALCULATOR_EFFORT_CHANGED, {
      effort: 'high',
    })
  })

  it('captureCalculatorSortChanged should send event with sort properties', () => {
    captureCalculatorSortChanged(
      { capture: mockPostHog.capture } as any,
      'totalCost',
      'desc',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.CALCULATOR_SORT_CHANGED, {
      sort_key: 'totalCost',
      sort_dir: 'desc',
    })
  })
})

describe('Quiz page events', () => {
  it('captureQuizStarted should send event with no properties', () => {
    captureQuizStarted({ capture: mockPostHog.capture } as any)
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.QUIZ_STARTED)
  })

  it('captureQuizStepAnswered should send event for step 1 (role)', () => {
    captureQuizStepAnswered(
      { capture: mockPostHog.capture } as any,
      1,
      'researcher',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.QUIZ_STEP_ANSWERED, {
      step: 1,
      role: 'researcher',
    })
  })

  it('captureQuizStepAnswered should send event for step 2 (task)', () => {
    captureQuizStepAnswered(
      { capture: mockPostHog.capture } as any,
      2,
      'reasoning',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.QUIZ_STEP_ANSWERED, {
      step: 2,
      task: 'reasoning',
    })
  })

  it('captureQuizStepAnswered should send event for step 3 (budget)', () => {
    captureQuizStepAnswered(
      { capture: mockPostHog.capture } as any,
      3,
      'enterprise',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.QUIZ_STEP_ANSWERED, {
      step: 3,
      budget: 'enterprise',
    })
  })

  it('captureQuizStepAnswered should send event for step 4 (company_pref)', () => {
    captureQuizStepAnswered(
      { capture: mockPostHog.capture } as any,
      4,
      'open-source',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.QUIZ_STEP_ANSWERED, {
      step: 4,
      company_pref: 'open-source',
    })
  })

  it('captureQuizCompleted should send event with picked model', () => {
    captureQuizCompleted(
      { capture: mockPostHog.capture } as any,
      'Claude 3.5 Opus',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.QUIZ_COMPLETED, {
      picked_model: 'Claude 3.5 Opus',
    })
  })

  it('captureQuizResultViewed should send event with no properties', () => {
    captureQuizResultViewed({ capture: mockPostHog.capture } as any)
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.QUIZ_RESULT_VIEWED)
  })

  it('captureQuizReset should send event with no properties', () => {
    captureQuizReset({ capture: mockPostHog.capture } as any)
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.QUIZ_RESET)
  })
})

describe('Learn page events', () => {
  it('captureLearnTopicViewed should send event with topic info', () => {
    captureLearnTopicViewed(
      { capture: mockPostHog.capture } as any,
      'what-are-tokens',
      'What Are Tokens?',
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.LEARN_TOPIC_VIEWED, {
      topic_slug: 'what-are-tokens',
      topic_title: 'What Are Tokens?',
    })
  })
})

describe('Web Vitals events', () => {
  it('captureWebVital should send LCP event with metrics', () => {
    captureWebVital(
      { capture: mockPostHog.capture } as any,
      EVENTS.WEB_VITAL_LCP,
      1800,
      'good',
      0,
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.WEB_VITAL_LCP, {
      value: 1800,
      rating: 'good',
      delta: 0,
    })
  })

  it('captureWebVital should send FID event with metrics', () => {
    captureWebVital(
      { capture: mockPostHog.capture } as any,
      EVENTS.WEB_VITAL_FID,
      45,
      'good',
      0,
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.WEB_VITAL_FID, {
      value: 45,
      rating: 'good',
      delta: 0,
    })
  })

  it('captureWebVital should send CLS event with metrics', () => {
    captureWebVital(
      { capture: mockPostHog.capture } as any,
      EVENTS.WEB_VITAL_CLS,
      0.05,
      'good',
      0.01,
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.WEB_VITAL_CLS, {
      value: 0.05,
      rating: 'good',
      delta: 0.01,
    })
  })

  it('captureWebVital should send TTFB event with metrics', () => {
    captureWebVital(
      { capture: mockPostHog.capture } as any,
      EVENTS.WEB_VITAL_TTFB,
      400,
      'good',
      0,
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.WEB_VITAL_TTFB, {
      value: 400,
      rating: 'good',
      delta: 0,
    })
  })

  it('captureWebVital should send FCP event with metrics', () => {
    captureWebVital(
      { capture: mockPostHog.capture } as any,
      EVENTS.WEB_VITAL_FCP,
      1200,
      'good',
      0,
    )
    expect(mockPostHog.capture).toHaveBeenCalledWith(EVENTS.WEB_VITAL_FCP, {
      value: 1200,
      rating: 'good',
      delta: 0,
    })
  })
})

describe('Null safety', () => {
  it('should handle null posthog gracefully', () => {
    // Should not throw when posthog is null/undefined
    expect(() => {
      captureFilterChange(null as any, 'anthropic')
    }).not.toThrow()
  })

  it('should handle posthog with missing capture method', () => {
    // Create a mock posthog that has capture but doesn't call it
    const invalidPostHog = {
      capture: undefined,
    } as any
    expect(() => {
      captureFilterChange(invalidPostHog, 'anthropic')
    }).not.toThrow()
  })

  it('should handle undefined posthog', () => {
    expect(() => {
      captureFilterChange(undefined as any, 'anthropic')
    }).not.toThrow()
  })
})
