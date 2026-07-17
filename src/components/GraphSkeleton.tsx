import { SkeletonLoader } from './SkeletonLoader'

/**
 * Skeleton loader for the Graph page.
 * Displays placeholder layout while the Graph component loads.
 */
export function GraphSkeleton() {
  return (
    <div className="space-y-8">
      {/* Title skeleton */}
      <SkeletonLoader className="h-12 w-full" />

      {/* Control area skeleton (axis pickers) */}
      <div className="space-y-4">
        <div className="space-y-2">
          <SkeletonLoader className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonLoader
                key={i}
                className="h-9 w-20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <SkeletonLoader className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonLoader
                key={i}
                className="h-9 w-20"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chart area skeleton */}
      <SkeletonLoader className="h-full w-full" height="h-96" />
    </div>
  )
}
