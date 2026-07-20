import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { breadcrumbSchema } from '../lib/routeMeta.ts'

export interface BreadcrumbItem {
  name: string
  path?: string // If undefined, this is the current page
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Generate breadcrumb schema for SEO
  const schema = useMemo(() => {
    const schemaItems = items.map((item) => ({
      name: item.name,
      path: item.path || '/',
    }))
    return breadcrumbSchema(schemaItems)
  }, [items])

  // Inject schema into head (only in browser)
  useMemo(() => {
    if (typeof document === 'undefined') return
    const id = 'breadcrumb-schema'
    let script = document.getElementById(id) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)
  }, [schema])

  return (
    <nav aria-label="Breadcrumb" className={`text-sm text-fg-muted overflow-x-auto ${className}`}>
      <ol className="inline-flex flex-nowrap gap-1 whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.name}-${index}`} className="flex items-center gap-1">
              {item.path ? (
                <>
                  <Link
                    to={item.path}
                    className="inline-flex min-h-6 items-center transition-colors duration-150 hover:text-fg-secondary"
                  >
                    {item.name}
                  </Link>
                  {!isLast && <span className="text-fg-muted">/</span>}
                </>
              ) : (
                <>
                  <span aria-current="page" className="text-fg-secondary">
                    {item.name}
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
