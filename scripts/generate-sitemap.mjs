#!/usr/bin/env node

/**
 * Generate sitemap.xml for all hardcoded routes in the Models.fyi static site.
 * Runs as part of the build process after prerender.mjs.
 *
 * Routes included:
 * - / (home)
 * - /compare
 * - /graph
 * - /calculator
 * - /quiz
 * - /learn
 * - /learn/:slug for each Learn topic
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

/**
 * Read topic slugs from src/pages/learn/topics.ts
 */
function readTopicSlugs() {
  const topicsPath = path.resolve(projectRoot, 'src/pages/learn/topics.ts')
  const content = fs.readFileSync(topicsPath, 'utf-8')

  // Extract slug values from the topics array
  // Regex matches: slug: 'string-value'
  const slugMatches = content.match(/slug:\s*['"]([^'"]+)['"]/g)

  if (!slugMatches) {
    console.warn('No topic slugs found in topics.ts, using empty array')
    return []
  }

  return slugMatches.map(match => match.replace(/slug:\s*['"]([^'"]+)['"]/, '$1'))
}

/**
 * Build the complete sitemap XML.
 */
function generateSitemap() {
  const baseUrl = 'https://models.fyi'
  const basePath = '/models.fyi' // GitHub Pages project path
  const buildDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const topicSlugs = readTopicSlugs()

  // Define all routes: [path, changefreq]
  const routes = [
    ['/', 'weekly'],
    ['/compare', 'monthly'],
    ['/graph', 'monthly'],
    ['/calculator', 'monthly'],
    ['/quiz', 'monthly'],
    ['/learn', 'monthly'],
    ...topicSlugs.map(slug => [`/learn/${slug}`, 'monthly']),
  ]

  // Build XML entries
  const urlEntries = routes.map(([path, changefreq]) => {
    const loc = `${baseUrl}${basePath}${path}`.replace(/\/+$/, '') || baseUrl + basePath + '/'
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
  </url>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`

  return xml
}

/**
 * Main entry point: write sitemap to dist/sitemap.xml
 */
function main() {
  try {
    const distDir = path.resolve(projectRoot, 'dist')

    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true })
    }

    const sitemapPath = path.resolve(distDir, 'sitemap.xml')
    const sitemapContent = generateSitemap()

    fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8')

    console.log(`✓ Generated sitemap: ${sitemapPath}`)
    console.log(`  Build date: ${new Date().toISOString().split('T')[0]}`)

  } catch (error) {
    console.error('✗ Error generating sitemap:', error.message)
    process.exit(1)
  }
}

main()
