import { useEffect } from 'react'
import { SITE_URL } from './routeMeta.ts'

export interface PageMetaOptions {
  title: string
  description: string
  image?: string
  type?: 'website' | 'article'
  structuredData?: Record<string, unknown>
  pathname?: string
}

/**
 * Sets the document title and meta description for a page.
 * Every route must call this — SEO is a product requirement.
 */
export function usePageMeta(title: string, description: string): void
export function usePageMeta(options: PageMetaOptions): void
export function usePageMeta(titleOrOptions: string | PageMetaOptions, description?: string): void {
  const options: PageMetaOptions =
    typeof titleOrOptions === 'string'
      ? { title: titleOrOptions, description: description || '' }
      : titleOrOptions

  useEffect(() => {
    // Set title
    document.title = options.title

    // Set meta description
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.name = 'description'
      document.head.appendChild(tag)
    }
    tag.content = options.description

    // Set OG tags
    setMetaTag('property', 'og:title', options.title)
    setMetaTag('property', 'og:description', options.description)
    if (options.image) {
      setMetaTag('property', 'og:image', options.image)
    }
    if (options.type) {
      setMetaTag('property', 'og:type', options.type)
    }

    // Set Twitter Card tags
    setMetaTag('name', 'twitter:title', options.title)
    setMetaTag('name', 'twitter:description', options.description)
    if (options.image) {
      setMetaTag('name', 'twitter:image', options.image)
    }
    setMetaTag('name', 'twitter:card', 'summary_large_image')

    // Set structured data (JSON-LD)
    if (options.structuredData) {
      let script = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]')
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(options.structuredData)
    }

    // Set canonical URL
    if (options.pathname) {
      const canonicalUrl = options.pathname === '/' ? SITE_URL : `${SITE_URL}${options.pathname}`
      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = canonicalUrl

      // Add og:url
      setMetaTag('property', 'og:url', canonicalUrl)
    }
  }, [
    options.title,
    options.description,
    options.image,
    options.type,
    options.structuredData,
    options.pathname,
  ])
}

function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attrName, attrValue)
    document.head.appendChild(tag)
  }
  tag.content = content
}
