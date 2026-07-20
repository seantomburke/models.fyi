import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function ScrollToTop() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const initialKey = useRef(location.key)

  useEffect(() => {
    if (location.key !== initialKey.current && navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [location.key, navigationType])

  return null
}
