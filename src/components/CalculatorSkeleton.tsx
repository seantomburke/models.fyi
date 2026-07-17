import { SkeletonLoader } from './SkeletonLoader'

/**
 * Skeleton loader for the Calculator page.
 * Displays placeholder layout while the Calculator component loads.
 */
export function CalculatorSkeleton() {
  return (
    <div className="space-y-8">
      {/* Title skeleton */}
      <SkeletonLoader className="h-12 w-full" />

      {/* Input fields area skeleton */}
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonLoader className="h-4 w-32" />
            <SkeletonLoader className="h-24 w-full" />
            <SkeletonLoader className="h-4 w-48" />
          </div>
        ))}
      </div>

      {/* Results area skeleton */}
      <div className="space-y-4">
        <SkeletonLoader className="h-6 w-40" />
        <SkeletonLoader className="h-full w-full" height="h-80" />
      </div>
    </div>
  )
}
