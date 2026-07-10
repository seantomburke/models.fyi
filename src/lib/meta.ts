import { useEffect } from 'react'

/**
 * Sets the document title and meta description for a page.
 * Every route must call this — SEO is a product requirement.
 */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.name = 'description'
      document.head.appendChild(tag)
    }
    tag.content = description
  }, [title, description])
}
