import type { ChartProps } from '@opendata-ai/openchart-react'
import type { DataRow } from '@opendata-ai/openchart-core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDarkMode } from '../lib/darkMode'

type OpenChartComponent = typeof import('@opendata-ai/openchart-react')['Chart']
type ChartListener = (component: OpenChartComponent) => void

let chartComponent: OpenChartComponent | null = null
let chartComponentPromise: Promise<OpenChartComponent> | null = null
const chartListeners = new Set<ChartListener>()

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

  return <Chart<TData> {...props} darkMode={isDark ? 'force' : 'off'} />
}
