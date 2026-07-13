/**
 * Single entry point for all Models.fyi data.
 * Import from here, never from the individual files.
 */
export type {
  Provider,
  ProviderId,
  Benchmark,
  BenchmarkId,
  Model,
  ModelTier,
} from './types.ts'
export { providers } from './providers.ts'
export { benchmarks } from './benchmarks.ts'
export { models } from './models.ts'

import { providers } from './providers.ts'
import type { Provider, ProviderId } from './types.ts'

/** Provider lookup by id, shared so pages don't each rebuild it. */
export const providerById: ReadonlyMap<ProviderId, Provider> = new Map(
  providers.map((p) => [p.id, p]),
)

/** When the dataset was last researched (ISO date). */
export const dataSourcedAt = '2026-07-13'
