import type { ChartProps } from '@opendata-ai/openchart-react'
import type { DataRow } from '@opendata-ai/openchart-core'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDarkMode } from '../lib/darkMode'

type OpenChartComponent = typeof import('@opendata-ai/openchart-react')['Chart']
type ChartListener = (component: OpenChartComponent) => void

let chartComponent: OpenChartComponent | null = null
let chartComponentPromise: Promise<OpenChartComponent> | null = null
const chartListeners = new Set<ChartListener>()
const LABELED_POINT_SELECTOR = 'svg.oc-chart circle[data-mark-id][aria-label]'
const LABELED_RULE_SELECTOR =
  'svg.oc-chart line.oc-mark-rule[data-mark-id^="rule-"][aria-label]'

/**
 * OpenChart labels primitive SVG marks without assigning roles that permit an
 * accessible name. Points represent selectable data, so retain their names
 * with an image role. Connection rules are decorative grouping hints and are
 * hidden instead of adding dozens of meaningless announcements.
 */
function normalizeChartMarkAccessibility(root: HTMLElement) {
  root.querySelectorAll<SVGCircleElement>(LABELED_POINT_SELECTOR).forEach((point) => {
    point.setAttribute('role', 'img')
  })

  root.querySelectorAll<SVGLineElement>(LABELED_RULE_SELECTOR).forEach((rule) => {
    rule.removeAttribute('aria-label')
    rule.setAttribute('aria-hidden', 'true')
  })
}

function loadChartComponent(): Promise<OpenChartComponent> {
  if (chartComponent) return Promise.resolve(chartComponent)

  chartComponentPromise ??= Promise.all([
    import('@opendata-ai/openchart-react'),
    import('@opendata-ai/openchart-react/styles.css'),
  ])
    .then(([module]) => {
      const component = module.Chart
      chartComponent = component
      chartListeners.forEach((listener) => listener(component))
      return component
    })
    .catch((error: unknown) => {
      chartComponentPromise = null
      console.error('Interactive chart failed to load.', error)
      throw error
    })

  return chartComponentPromise
}

interface ThemeAwareChartProps<TData extends DataRow> extends Omit<ChartProps<TData>, 'darkMode'> {
  deferUntilInteraction?: boolean
}

export function ThemeAwareChart<TData extends DataRow = DataRow>({
  deferUntilInteraction = false,
  ...props
}: ThemeAwareChartProps<TData>) {
  const [isDark] = useDarkMode()
  const [Chart, setChart] = useState<OpenChartComponent | null>(() => chartComponent)
  const [loadError, setLoadError] = useState(false)
  const mountedRef = useRef(true)
  const chartRootRef = useRef<HTMLDivElement>(null)

  const beginLoad = useCallback(() => {
    if (Chart) return
    setLoadError(false)
    loadChartComponent()
      .then((component) => {
        if (mountedRef.current) setChart(() => component)
      })
      .catch(() => {
        if (mountedRef.current) setLoadError(true)
      })
  }, [Chart])

  useEffect(() => {
    mountedRef.current = true
    const handleLoaded: ChartListener = (component) => {
      if (!mountedRef.current) return
      setLoadError(false)
      setChart(() => component)
    }
    chartListeners.add(handleLoaded)
    return () => {
      mountedRef.current = false
      chartListeners.delete(handleLoaded)
    }
  }, [])

  useEffect(() => {
    if (Chart || loadError) return
    if (!deferUntilInteraction) {
      beginLoad()
      return
    }

    window.addEventListener('scroll', beginLoad, { once: true, passive: true })
    return () => window.removeEventListener('scroll', beginLoad)
  }, [beginLoad, Chart, deferUntilInteraction, loadError])

  useLayoutEffect(() => {
    const root = chartRootRef.current
    if (!root || !Chart) return

    normalizeChartMarkAccessibility(root)
    const observer = new MutationObserver(() => normalizeChartMarkAccessibility(root))
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'class', 'data-mark-id'],
    })
    return () => observer.disconnect()
  }, [Chart, isDark])

  if (!Chart) {
    return (
      <div
        role={loadError ? 'alert' : 'status'}
        aria-label={loadError ? 'Interactive chart unavailable' : 'Interactive chart not loaded'}
        className="flex h-full min-h-40 items-center justify-center text-sm text-fg-muted"
      >
        <div className="text-center">
          <p>{loadError ? 'The interactive chart could not be loaded.' : 'Chart ready to load.'}</p>
          <button
            type="button"
            onClick={beginLoad}
            className="mt-2 rounded-lg border border-line px-3 py-2 font-medium text-fg-secondary hover:border-line-strong hover:text-fg"
          >
            {loadError ? 'Try again' : 'Load chart'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={chartRootRef} className="h-full w-full">
      <Chart<TData> {...props} darkMode={isDark ? 'force' : 'off'} />
    </div>
  )
}
