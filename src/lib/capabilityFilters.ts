import type { Model } from '../data/types.ts'

export type CapabilityFilter = 'reasoning' | 'vision' | 'web-search' | 'image-generation'

export interface CapabilityFilterOption {
  id: CapabilityFilter
  label: string
  emoji: string
  description: string
}

export const capabilityOptions: CapabilityFilterOption[] = [
  {
    id: 'reasoning',
    label: 'Reasoning',
    emoji: '🧠',
    description: 'Model thinks step-by-step before answering',
  },
  {
    id: 'vision',
    label: 'Vision',
    emoji: '👁️',
    description: 'Can understand images and visual content',
  },
  {
    id: 'web-search',
    label: 'Web search',
    emoji: '🌐',
    description: 'Can search the live internet',
  },
  {
    id: 'image-generation',
    label: 'Image generation',
    emoji: '🎨',
    description: 'Can generate and create images',
  },
]

export function hasCapability(model: Model, capability: CapabilityFilter): boolean {
  switch (capability) {
    case 'reasoning':
      return model.reasoning
    case 'vision':
      return model.vision ?? false
    case 'web-search':
      return model.internetAccess
    case 'image-generation':
      return model.imageGeneration ?? false
  }
}

export function filterByCapabilities(models: Model[], capabilities: Set<CapabilityFilter>): Model[] {
  if (capabilities.size === 0) return models

  return models.filter((model) => {
    // All selected capabilities must be present
    for (const cap of capabilities) {
      if (!hasCapability(model, cap)) return false
    }
    return true
  })
}
