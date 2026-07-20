import { Chart } from '@opendata-ai/openchart-react'
import type { ChartProps } from '@opendata-ai/openchart-react'
import type { DataRow } from '@opendata-ai/openchart-core'
import { useDarkMode } from '../lib/darkMode'

export function ThemeAwareChart<TData extends DataRow = DataRow>(
  props: Omit<ChartProps<TData>, 'darkMode'>,
) {
  const [isDark] = useDarkMode()
  return <Chart<TData> {...props} darkMode={isDark ? 'force' : 'off'} />
}
