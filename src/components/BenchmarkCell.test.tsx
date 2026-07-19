import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BenchmarkCell } from './BenchmarkCell'
import type { Benchmark } from '../data/types'

const mockBenchmark: Benchmark = {
  id: 'gpqa-diamond',
  name: 'Test Benchmark',
  eli5: 'A test benchmark for testing',
  unit: '%',
  category: 'Reasoning',
  sourceUrl: 'https://example.com/test',
  confidence: 'independent',
  sourceOrganization: 'Test Org',
}

describe('BenchmarkCell', () => {
  it('renders score with percentage', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={85.3} isBest={false} />)
    expect(screen.getByText('85.3%')).toBeInTheDocument()
  })

  it('renders dash for undefined score', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={undefined} isBest={false} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows best score styling', () => {
    const { container } = render(
      <BenchmarkCell benchmark={mockBenchmark} score={95.0} isBest={true} />,
    )
    const td = container.querySelector('td')
    expect(td).toHaveClass('text-accent-deep')
    expect(td).toHaveClass('font-semibold')
  })

  it('renders confidence badge for independent benchmarks', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={75.0} isBest={false} />)
    const badge = screen.getByTitle('Independent run')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-blue-500')
  })

  it('renders confidence badge with published color', () => {
    const publishedBenchmark = { ...mockBenchmark, confidence: 'published' as const }
    render(<BenchmarkCell benchmark={publishedBenchmark} score={80.0} isBest={false} />)
    const badge = screen.getByTitle('Published by provider')
    expect(badge).toHaveClass('bg-green-500')
  })

  it('renders confidence badge with mixed color', () => {
    const mixedBenchmark = { ...mockBenchmark, confidence: 'mixed' as const }
    render(<BenchmarkCell benchmark={mixedBenchmark} score={82.0} isBest={false} />)
    const badge = screen.getByTitle('Mixed sources')
    expect(badge).toHaveClass('bg-yellow-500')
  })

  it('has proper accessibility labels', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={88.5} isBest={false} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })

  it('renders without source URL', () => {
    const benchmarkWithoutSource = { ...mockBenchmark, sourceUrl: undefined }
    render(<BenchmarkCell benchmark={benchmarkWithoutSource} score={75.0} isBest={false} />)
    expect(screen.getByText('75.0%')).toBeInTheDocument()
  })

  it('displays benchmark name with source URL', () => {
    render(<BenchmarkCell benchmark={mockBenchmark} score={90.0} isBest={false} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', expect.stringContaining('Test Benchmark'))
  })

  it('no badge without confidence level', () => {
    const benchmarkNoConfidence = { ...mockBenchmark, confidence: undefined }
    render(<BenchmarkCell benchmark={benchmarkNoConfidence} score={75.0} isBest={false} />)
    expect(screen.getByText('75.0%')).toBeInTheDocument()
  })
})
