import type { Model } from '../data/types'

interface ScoredModel {
  model: Model
  score: number
}

/**
 * Scoring algorithm for model recommendations.
 * Scores candidate models and returns the top recommendations.
 *
 * Scoring rules (cumulative):
 * - Same provider: +50 points
 * - Same tier: +30 points
 * - Similar context window (within 50%): +20 points
 * - Capability match (shared reasoning/internet access): +10 points per match
 */
export function scoreModelRecommendation(currentModel: Model, candidate: Model): number {
  // Don't recommend the same model
  if (currentModel.id === candidate.id) {
    return -1
  }

  let score = 0

  // Same provider: +50 points
  if (currentModel.providerId === candidate.providerId) {
    score += 50
  }

  // Same tier: +30 points
  if (currentModel.tier === candidate.tier) {
    score += 30
  }

  // Similar context window (within 50%): +20 points
  if (currentModel.contextWindowTokens && candidate.contextWindowTokens) {
    const currentCtx = currentModel.contextWindowTokens
    const candidateCtx = candidate.contextWindowTokens
    const ratio = Math.max(currentCtx, candidateCtx) / Math.min(currentCtx, candidateCtx)
    if (ratio <= 1.5) {
      score += 20
    }
  }

  // Capability match: +10 points per capability
  if (currentModel.reasoning === candidate.reasoning && currentModel.reasoning) {
    score += 10
  }
  if (currentModel.internetAccess === candidate.internetAccess && currentModel.internetAccess) {
    score += 10
  }

  return score
}

/**
 * Get recommended models for a given model.
 * First tries hand-curated IDs, then falls back to scoring algorithm.
 * Returns up to 3 recommendations.
 */
export function getRecommendedModels(currentModel: Model, allModels: Model[]): Model[] {
  // If hand-curated IDs exist, use them
  if (currentModel.relatedModelIds && currentModel.relatedModelIds.length > 0) {
    const curated = currentModel.relatedModelIds
      .map((id) => allModels.find((m) => m.id === id))
      .filter((m) => m !== undefined) as Model[]

    if (curated.length > 0) {
      return curated.slice(0, 3)
    }
  }

  // Fall back to scoring algorithm
  const scored: ScoredModel[] = allModels
    .map((candidate) => ({
      model: candidate,
      score: scoreModelRecommendation(currentModel, candidate),
    }))
    .filter(({ score }) => score >= 0) // Only include models with non-negative scores
    .sort((a, b) => b.score - a.score) // Sort descending by score

  // Return top 3 scored models
  return scored
    .slice(0, 3)
    .map(({ model }) => model)
}
