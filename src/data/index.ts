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

/** When the dataset was last researched (ISO date). */
export const dataSourcedAt = '2026-07-11'
