import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { capture } from '../lib/analytics.ts'

export const usePostHogPageView = () => {
  const location = useLocation()

  useEffect(() => {
    capture('$pageview')
  }, [location])
}
