interface SkeletonLoaderProps {
  className?: string
  lines?: number
  height?: string
}

/**
 * Reusable skeleton loader component for loading states.
 * Displays animated gray placeholder boxes while content loads.
 */
export function SkeletonLoader({
  className = 'h-52 w-full',
  lines,
  height,
}: SkeletonLoaderProps) {
  // If lines prop is provided, render multiple skeleton lines
  if (lines !== undefined) {
    if (lines <= 0) {
      return null
    }
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 w-full animate-pulse rounded bg-line"
          />
        ))}
      </div>
    )
  }

  // Single skeleton block with optional custom height
  const finalClassName = height
    ? `${className.replace(/h-\d+/, '')} ${height} animate-pulse rounded bg-line`
    : `${className} animate-pulse rounded bg-line`

  return <div className={finalClassName} />
}
