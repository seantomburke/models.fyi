import { render } from '@testing-library/react'
import { SkeletonLoader } from './SkeletonLoader'

describe('SkeletonLoader', () => {
  test('renders a skeleton element', () => {
    const { container } = render(<SkeletonLoader />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  test('applies default className when not provided', () => {
    const { container } = render(<SkeletonLoader />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toHaveClass('h-52')
    expect(skeleton).toHaveClass('w-full')
  })

  test('applies custom className', () => {
    const { container } = render(
      <SkeletonLoader className="h-32 w-1/2" />
    )
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toHaveClass('h-32')
    expect(skeleton).toHaveClass('w-1/2')
  })

  test('applies pulse and line color styling', () => {
    const { container } = render(<SkeletonLoader />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toHaveClass('animate-pulse')
    expect(skeleton).toHaveClass('bg-line')
    expect(skeleton).toHaveClass('rounded')
  })

  test('renders multiple lines when lines prop is provided', () => {
    const { container } = render(<SkeletonLoader lines={3} />)
    const lines = container.querySelectorAll('.animate-pulse')
    expect(lines).toHaveLength(3)
  })

  test('renders nothing when lines is 0', () => {
    const { container } = render(<SkeletonLoader lines={0} />)
    // When lines is 0, the component returns null, so container should be empty
    expect(container.firstChild).toBeNull()
  })

  test('applies custom height when provided', () => {
    const { container } = render(<SkeletonLoader height="h-64" />)
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toHaveClass('h-64')
  })
})
