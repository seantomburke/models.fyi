import { capture } from './analytics.ts'

export const trackPageView = (pageName: string, properties?: Record<string, unknown>) => {
  capture('page_view', {
    page_name: pageName,
    ...properties,
  })
}

export const trackModelInteraction = (
  action: 'view' | 'compare' | 'click',
  modelName: string,
  properties?: Record<string, unknown>,
) => {
  capture(`model_${action}`, {
    model_name: modelName,
    ...properties,
  })
}

export const trackSearch = (query: string, resultCount: number) => {
  capture('search_executed', {
    query,
    result_count: resultCount,
  })
}

export const trackQuizInteraction = (
  action: 'start' | 'answer' | 'complete',
  properties?: Record<string, unknown>,
) => {
  capture(`quiz_${action}`, properties)
}

export const trackCalculatorUsage = (
  action: 'open' | 'calculate' | 'change_model',
  properties?: Record<string, unknown>,
) => {
  capture(`calculator_${action}`, properties)
}

export const trackGraphInteraction = (
  action: 'view' | 'filter' | 'interact',
  properties?: Record<string, unknown>,
) => {
  capture(`graph_${action}`, properties)
}

export const trackLearnAccess = (topicSlug: string) => {
  capture('learn_topic_viewed', {
    topic_slug: topicSlug,
  })
}

export const trackUIError = (
  errorType: string,
  message: string,
  context?: Record<string, unknown>,
) => {
  capture('ui_error', {
    error_type: errorType,
    error_message: message,
    ...context,
  })
}

export const trackPerformance = (
  metricName: string,
  duration: number,
  properties?: Record<string, unknown>,
) => {
  capture('performance_metric', {
    metric_name: metricName,
    duration_ms: duration,
    ...properties,
  })
}
