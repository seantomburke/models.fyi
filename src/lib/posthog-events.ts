import { usePostHog } from './posthog-react.ts'

/**
 * Centralized PostHog event tracking system for models.fyi.
 * Defines all event types and provides helper functions for consistent event capture.
 */

export const EVENTS = {
  // Compare page events
  COMPARE_FILTER_CHANGED: 'compare_filter_changed',
  COMPARE_FILTER_CLEARED: 'compare_filter_cleared',
  COMPARE_TABLE_SORTED: 'compare_table_sorted',
  COMPARE_TABLE_EXPORTED: 'compare_table_exported',
  COMPARE_TABLE_EXPORT_FAILED: 'compare_table_export_failed',
  COMPARE_BENCHMARK_CLICKED: 'compare_benchmark_clicked',
  COMPARE_VIEW_MODE_CHANGED: 'compare_view_mode_changed',

  // Graph page events
  GRAPH_AXES_CHANGED: 'graph_axes_changed',
  GRAPH_POINT_SELECTED: 'graph_point_selected',

  // Calculator page events
  CALCULATOR_TEXT_ENTERED: 'calculator_text_entered',
  CALCULATOR_OUTPUT_CHANGED: 'calculator_output_changed',
  CALCULATOR_EFFORT_CHANGED: 'calculator_effort_changed',
  CALCULATOR_SORT_CHANGED: 'calculator_sort_changed',

  // Quiz page events
  QUIZ_STARTED: 'quiz_started',
  QUIZ_STEP_ANSWERED: 'quiz_step_answered',
  QUIZ_COMPLETED: 'quiz_completed',
  QUIZ_RESULT_VIEWED: 'quiz_result_viewed',
  QUIZ_RESET: 'quiz_reset',

  // Learn page events
  LEARN_TOPIC_VIEWED: 'learn_topic_viewed',

  // Model interaction events
  MODEL_CLICKED: 'model_clicked',
  BENCHMARK_SOURCE_CLICKED: 'benchmark_source_clicked',

  // Web Vitals events
  WEB_VITAL_LCP: 'web_vital_lcp',
  WEB_VITAL_FID: 'web_vital_fid',
  WEB_VITAL_CLS: 'web_vital_cls',
  WEB_VITAL_TTFB: 'web_vital_ttfb',
  WEB_VITAL_FCP: 'web_vital_fcp',
} as const

export type EventName = (typeof EVENTS)[keyof typeof EVENTS]

/**
 * Event properties shared across different event types.
 * Extend this interface for event-specific properties.
 */
export interface EventProperties {
  // Compare page
  filter?: string
  model_count?: number
  column?: string
  direction?: 'asc' | 'desc'
  success?: boolean
  error?: string
  benchmark_id?: string

  // Graph page
  axis?: 'x' | 'y'
  axis_id?: string
  model?: string
  provider?: string
  x?: string | number
  y?: string | number

  // Calculator page
  field?: 'input' | 'output'
  effort?: string
  sort_key?: string
  sort_dir?: 'asc' | 'desc'

  // Quiz page
  step?: number
  role?: string
  task?: string
  budget?: string
  company_pref?: string
  picked_model?: string

  // Learn page
  topic_slug?: string
  topic_title?: string

  // Web Vitals
  value?: number
  rating?: string
  delta?: number
}

/**
 * Capture a compare filter change event.
 */
export function captureFilterChange(posthog: ReturnType<typeof usePostHog>, filter: string): void {
  posthog?.capture?.(EVENTS.COMPARE_FILTER_CHANGED, {
    filter,
  })
}

/**
 * Capture a compare filter clear event.
 */
export function captureFilterCleared(posthog: ReturnType<typeof usePostHog>): void {
  posthog?.capture?.(EVENTS.COMPARE_FILTER_CLEARED)
}

/**
 * Capture a compare view mode change (table vs. cards).
 */
export function captureViewModeChange(
  posthog: ReturnType<typeof usePostHog>,
  viewMode: 'table' | 'cards',
): void {
  posthog?.capture?.(EVENTS.COMPARE_VIEW_MODE_CHANGED, {
    view_mode: viewMode,
  })
}

/**
 * Capture a compare table sort event.
 */
export function captureSortChange(
  posthog: ReturnType<typeof usePostHog>,
  column: string,
  direction: 'asc' | 'desc',
): void {
  posthog?.capture?.(EVENTS.COMPARE_TABLE_SORTED, {
    column,
    direction,
  })
}

/**
 * Capture a compare table export event.
 */
export function captureExport(posthog: ReturnType<typeof usePostHog>, modelCount: number): void {
  posthog?.capture?.(EVENTS.COMPARE_TABLE_EXPORTED, {
    model_count: modelCount,
    success: true,
  })
}

/**
 * Capture a compare table export failure event.
 */
export function captureExportFailed(
  posthog: ReturnType<typeof usePostHog>,
  modelCount: number,
  error: string,
): void {
  posthog?.capture?.(EVENTS.COMPARE_TABLE_EXPORT_FAILED, {
    model_count: modelCount,
    error,
  })
}

/**
 * Capture a benchmark source link click event.
 */
export function captureBenchmarkSourceClick(
  posthog: ReturnType<typeof usePostHog>,
  benchmarkId: string,
): void {
  posthog?.capture?.(EVENTS.COMPARE_BENCHMARK_CLICKED, {
    benchmark_id: benchmarkId,
  })
}

/**
 * Capture a graph axes change event.
 */
export function captureGraphAxesChange(
  posthog: ReturnType<typeof usePostHog>,
  axis: 'x' | 'y',
  axisId: string,
): void {
  posthog?.capture?.(EVENTS.GRAPH_AXES_CHANGED, {
    axis,
    axis_id: axisId,
  })
}

/**
 * Capture a graph point selection event.
 */
export function captureGraphPointSelected(
  posthog: ReturnType<typeof usePostHog>,
  model: string,
  provider: string,
  x: string | number,
  y: string | number,
): void {
  posthog?.capture?.(EVENTS.GRAPH_POINT_SELECTED, {
    model,
    provider,
    x,
    y,
  })
}

/**
 * Capture a calculator text entry event.
 */
export function captureCalculatorTextEntered(
  posthog: ReturnType<typeof usePostHog>,
  field: 'input' | 'output',
): void {
  posthog?.capture?.(EVENTS.CALCULATOR_TEXT_ENTERED, {
    field,
  })
}

/**
 * Capture a calculator output change event.
 */
export function captureCalculatorOutputChanged(posthog: ReturnType<typeof usePostHog>): void {
  posthog?.capture?.(EVENTS.CALCULATOR_OUTPUT_CHANGED)
}

/**
 * Capture a calculator effort change event.
 */
export function captureCalculatorEffortChanged(
  posthog: ReturnType<typeof usePostHog>,
  effort: string,
): void {
  posthog?.capture?.(EVENTS.CALCULATOR_EFFORT_CHANGED, {
    effort,
  })
}

/**
 * Capture a calculator sort change event.
 */
export function captureCalculatorSortChanged(
  posthog: ReturnType<typeof usePostHog>,
  sortKey: string,
  sortDir: 'asc' | 'desc',
): void {
  posthog?.capture?.(EVENTS.CALCULATOR_SORT_CHANGED, {
    sort_key: sortKey,
    sort_dir: sortDir,
  })
}

/**
 * Capture a quiz start event.
 */
export function captureQuizStarted(posthog: ReturnType<typeof usePostHog>): void {
  posthog?.capture?.(EVENTS.QUIZ_STARTED)
}

/**
 * Capture a quiz step answer event.
 */
export function captureQuizStepAnswered(
  posthog: ReturnType<typeof usePostHog>,
  step: number,
  selectedValue: string,
): void {
  posthog?.capture?.(EVENTS.QUIZ_STEP_ANSWERED, {
    step,
    [getQuizStepPropertyName(step)]: selectedValue,
  })
}

/**
 * Capture a quiz completion event.
 */
export function captureQuizCompleted(
  posthog: ReturnType<typeof usePostHog>,
  pickedModel: string,
): void {
  posthog?.capture?.(EVENTS.QUIZ_COMPLETED, {
    picked_model: pickedModel,
  })
}

/**
 * Capture a quiz result view event.
 */
export function captureQuizResultViewed(posthog: ReturnType<typeof usePostHog>): void {
  posthog?.capture?.(EVENTS.QUIZ_RESULT_VIEWED)
}

/**
 * Capture a quiz reset event.
 */
export function captureQuizReset(posthog: ReturnType<typeof usePostHog>): void {
  posthog?.capture?.(EVENTS.QUIZ_RESET)
}

/**
 * Capture a learn topic view event.
 */
export function captureLearnTopicViewed(
  posthog: ReturnType<typeof usePostHog>,
  topicSlug: string,
  topicTitle: string,
): void {
  posthog?.capture?.(EVENTS.LEARN_TOPIC_VIEWED, {
    topic_slug: topicSlug,
    topic_title: topicTitle,
  })
}

/**
 * Capture a web vital metric event.
 */
export function captureWebVital(
  posthog: ReturnType<typeof usePostHog>,
  eventName: EventName,
  value: number,
  rating: string,
  delta: number,
): void {
  posthog?.capture?.(eventName, {
    value,
    rating,
    delta,
  })
}

/**
 * Get the property name for a quiz step's answer.
 * Steps are: 1=role, 2=task, 3=budget, 4=company_pref
 */
function getQuizStepPropertyName(step: number): string {
  const stepProps: Record<number, string> = {
    1: 'role',
    2: 'task',
    3: 'budget',
    4: 'company_pref',
  }
  return stepProps[step] || `step_${step}`
}
