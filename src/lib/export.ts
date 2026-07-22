import { benchmarks, providerById, dataSourcedAt } from '../data/index.ts'
import type { Model, BenchmarkId } from '../data/index.ts'
import { formatPrice, formatTokens, formatDateForCSV } from './format.ts'

/**
 * Escape a string for CSV export per RFC 4180.
 * Enclose in quotes if the value contains comma, quote, newline, carriage return,
 * or leading/trailing whitespace. Double any internal quotes.
 */
function escapeCSV(value: string): string {
  const needsEscaping =
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r') ||
    value !== value.trim()

  if (needsEscaping) {
    return `"${value.replace(/"/g, '""')}"` // Escape quotes by doubling them
  }
  return value
}

/**
 * Convert a score to a CSV-friendly format.
 * Returns the numeric score or empty string for undefined scores.
 */
function formatScoreForCSV(score: number | undefined): string {
  return score !== undefined ? score.toFixed(1) : ''
}

/**
 * Generate CSV content for the comparison table.
 * Includes headers, all visible models, benchmarks, pricing, and context window data.
 *
 * @param visibleModels - Models to include in the export (filtered by user's current filter)
 * @returns CSV string ready for download
 */
export function generateComparisonCSV(visibleModels: Model[]): string {
  const lines: string[] = []

  // Build header row
  const headerRow: string[] = ['Model', 'Provider', 'Tier', 'Release Date']

  // Pre-build benchmark IDs array to avoid repeated array access
  const benchmarkIds = benchmarks.map((b) => b.id as BenchmarkId)

  // Add benchmark headers
  for (const benchmark of benchmarks) {
    headerRow.push(benchmark.name)
  }

  // Add pricing and context headers
  headerRow.push('Input Price (per 1M tokens)', 'Output Price (per 1M tokens)', 'Context Window')

  // Add capability headers
  headerRow.push('Reasoning', 'Web Access', 'Open Source', 'License')

  lines.push(headerRow.map(escapeCSV).join(','))

  // Build data rows
  for (const model of visibleModels) {
    const provider = providerById.get(model.providerId)
    const row: string[] = [
      model.name,
      provider?.name || 'Unknown',
      model.tier,
      formatDateForCSV(model.releaseDate),
    ]

    // Add benchmark scores using pre-built benchmark IDs
    for (const benchmarkId of benchmarkIds) {
      row.push(formatScoreForCSV(model.scores[benchmarkId]))
    }

    // Add pricing
    row.push(
      model.inputPricePerMTok !== null ? formatPrice(model.inputPricePerMTok) : 'Free',
      model.outputPricePerMTok !== null ? formatPrice(model.outputPricePerMTok) : 'Free',
    )

    // Add context window
    row.push(model.contextWindowTokens !== null ? formatTokens(model.contextWindowTokens) : '')

    // Add capabilities
    row.push(
      model.reasoning ? 'Yes' : 'No',
      model.internetAccess ? 'Yes' : 'No',
      model.openSource ? 'Yes' : 'No',
      model.license || '',
    )

    lines.push(row.map(escapeCSV).join(','))
  }

  // Add metadata footer
  lines.push('')
  lines.push(`"Data sourced: ${dataSourcedAt}"`)
  lines.push(`"Benchmark scores are provider-published evals where available, otherwise independent leaderboard runs."`)

  return lines.join('\n')
}

/**
 * Generate a filename for the export with today's date.
 * Format: models-comparison-YYYY-MM-DD.csv
 */
export function generateExportFilename(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `models-comparison-${year}-${month}-${day}.csv`
}

/**
 * Trigger a CSV download in the browser.
 * Creates a blob and simulates a click on a temporary download link.
 *
 * @param csv - CSV content as a string
 * @param filename - Filename for the downloaded file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Delay revocation to ensure download starts before URL is released
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Generate JSON content for the comparison table.
 * Returns structured data suitable for programmatic use.
 */
export function generateComparisonJSON(visibleModels: Model[]): string {
  const data = {
    metadata: {
      exportedAt: new Date().toISOString(),
      dataSourcedAt: dataSourcedAt,
      modelCount: visibleModels.length,
      benchmarkCount: benchmarks.length,
    },
    models: visibleModels.map((model) => ({
      id: model.id,
      name: model.name,
      provider: providerById.get(model.providerId)?.name || 'Unknown',
      tier: model.tier,
      releaseDate: model.releaseDate,
      pricing: {
        input: model.inputPricePerMTok,
        output: model.outputPricePerMTok,
      },
      contextWindow: model.contextWindowTokens,
      capabilities: {
        reasoning: model.reasoning,
        internetAccess: model.internetAccess,
        openSource: model.openSource,
        license: model.license,
      },
      benchmarks: Object.fromEntries(
        benchmarks
          .map((b) => [b.id, model.scores[b.id as BenchmarkId]])
          .filter(([, score]) => score !== undefined),
      ),
    })),
    benchmarks: benchmarks.map((b) => ({
      id: b.id,
      name: b.name,
      eli5: b.eli5,
    })),
  }
  return JSON.stringify(data, null, 2)
}

/**
 * Generate Markdown content for the comparison table.
 * Returns a markdown table suitable for documentation and blogs.
 */
export function generateComparisonMarkdown(visibleModels: Model[]): string {
  const lines: string[] = []

  lines.push('# AI Model Comparison')
  lines.push(`*Exported: ${new Date().toLocaleString()}*`)
  lines.push(`*Data sourced: ${dataSourcedAt}*`)
  lines.push('')

  // Models table
  lines.push('## Models')
  lines.push('')

  const headers = ['Model', 'Provider', 'Tier', 'Input Price', 'Output Price', 'Context Window']
  lines.push(`| ${headers.join(' | ')} |`)
  lines.push(`| ${headers.map(() => '---').join(' | ')} |`)

  for (const model of visibleModels) {
    const provider = providerById.get(model.providerId)
    lines.push(
      `| **${model.name}** | ${provider?.name || 'Unknown'} | ${model.tier} | $${formatPrice(model.inputPricePerMTok)} | $${formatPrice(model.outputPricePerMTok)} | ${formatTokens(model.contextWindowTokens)} |`,
    )
  }

  lines.push('')

  // Benchmark scores
  lines.push('## Benchmark Scores')
  lines.push('')

  const benchmarkHeaders = ['Model', ...benchmarks.map((b) => b.name)]
  lines.push(`| ${benchmarkHeaders.join(' | ')} |`)
  lines.push(`| ${benchmarkHeaders.map(() => '---').join(' | ')} |`)

  for (const model of visibleModels) {
    const scores = benchmarks
      .map((b) => {
        const score = model.scores[b.id as BenchmarkId]
        return score !== undefined ? score.toFixed(1) : '-'
      })
    lines.push(`| **${model.name}** | ${scores.join(' | ')} |`)
  }

  lines.push('')

  // Capabilities
  lines.push('## Capabilities')
  lines.push('')

  const capabilityHeaders = ['Model', 'Reasoning', 'Web Access', 'Open Source']
  lines.push(`| ${capabilityHeaders.join(' | ')} |`)
  lines.push(`| ${capabilityHeaders.map(() => '---').join(' | ')} |`)

  for (const model of visibleModels) {
    lines.push(
      `| **${model.name}** | ${model.reasoning ? '✓' : '-'} | ${model.internetAccess ? '✓' : '-'} | ${model.openSource ? '✓' : '-'} |`,
    )
  }

  return lines.join('\n')
}

export type ExportFormat = 'csv' | 'json' | 'markdown'

/**
 * Export the comparison table in the specified format.
 * Supports CSV, JSON, and Markdown formats.
 *
 * @param visibleModels - Models to include in the export
 * @param format - Export format (csv, json, or markdown)
 */
export function exportComparison(visibleModels: Model[], format: ExportFormat = 'csv'): void {
  let content: string
  let mimeType: string
  let extension: string
  let baseFilename = generateExportFilename().replace('.csv', '')

  switch (format) {
    case 'json': {
      content = generateComparisonJSON(visibleModels)
      mimeType = 'application/json;charset=utf-8;'
      extension = '.json'
      break
    }
    case 'markdown': {
      content = generateComparisonMarkdown(visibleModels)
      mimeType = 'text/markdown;charset=utf-8;'
      extension = '.md'
      break
    }
    case 'csv':
    default: {
      content = generateComparisonCSV(visibleModels)
      mimeType = 'text/csv;charset=utf-8;'
      extension = '.csv'
      break
    }
  }

  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', baseFilename + extension)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}
