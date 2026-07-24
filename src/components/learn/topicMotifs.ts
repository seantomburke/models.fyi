import type { Motif } from './TopicCardAnimation'

/**
 * Which animated motif each /learn topic shows on its index card.
 *
 * The lab topics reuse the visual idea from their own learning pane (the
 * pixel grid, the digit outputs, the layer sweep, the ball on the loss curve)
 * so the card previews what you get when you click it. The rest get the
 * closest honest picture of their subject.
 *
 * Kept beside the motifs rather than in topics.ts so adding a motif and
 * assigning it are one edit, and so the index route never has to import the
 * lab's real models to draw a thumbnail.
 */
export const TOPIC_MOTIFS: Record<string, Motif> = {
  // Basics
  'what-is-an-ai-model': 'weights',
  'what-is-an-llm': 'nextWord',
  'what-is-gpt': 'layers',
  'what-is-a-context-window': 'context',
  'what-is-a-token': 'tokens',
  'reasoning-models': 'reasoning',
  'which-model-should-i-use': 'chooser',

  // Intermediate
  'claude-vs-gpt': 'compare',
  'claude-vs-gemini': 'compare',
  'grok-vs-gpt': 'compare',
  'best-model-for-coding': 'chooser',
  'best-model-for-writing': 'prompt',
  'best-model-for-research': 'search',
  'vision-models': 'vision',
  'model-pricing-tokens': 'pricing',
  'prompt-engineering-basics': 'prompt',
  'web-search-models': 'search',
  'hallucinations': 'hallucination',
  'open-source-vs-closed-source': 'openSource',

  // Advanced
  'embedding-models': 'embedding',
  'fine-tuning-models': 'tuning',
  'context-window-strategies': 'context',
  // The Bayesian lesson ends on next-word prediction, so its card previews it.
  'bayesian-statistics': 'nextWord',

  // The model lab: each card mirrors its own interactive pane.
  'how-do-neural-network-weights-work': 'weights',
  'understand-image-classification': 'pixels',
  'how-neural-networks-recognize-digits': 'digits',
  'what-is-gradient-descent': 'descent',
  'train-a-neural-network': 'training',
  'how-llms-predict-the-next-word': 'nextWord',
  'how-word-embeddings-predict-the-next-word': 'embedding',
  'how-position-and-attention-make-language-models-grammatical': 'attention',
  'why-neural-networks-need-more-layers': 'layers',
}

/** Plain-English alt text for each motif, for screen readers. */
export const MOTIF_LABELS: Record<Motif, string> = {
  tokens: 'Text splitting into colored token chunks',
  weights: 'A row of weights swinging between positive and negative',
  pixels: 'A digit being drawn onto an 8 by 8 pixel grid',
  digits: 'Ten digit outputs lighting up one at a time',
  layers: 'A signal sweeping left to right through four layers of neurons',
  descent: 'A ball rolling down a curve to its lowest point',
  nextWord: 'A sentence building up, then the next word predicted',
  context: 'A context window filling with text',
  compare: 'Two bars trading the lead in a head-to-head comparison',
  pricing: 'Stacks of cost rising and falling',
  vision: 'A frame scanning across an image',
  embedding: 'Points drifting together into clusters of meaning',
  attention: 'A sentence position looking back at earlier word signals',
  reasoning: 'A chain of reasoning steps connecting to an answer',
  search: 'A magnifier sweeping across search results',
  tuning: 'A general model narrowing onto one specialty',
  prompt: 'A rough prompt sharpening into clean instructions',
  hallucination: 'Confident output where one claim is flagged as wrong',
  openSource: 'A closed model box next to an open one',
  chooser: 'Options narrowing down to a single pick',
  training: 'Documents riding a conveyor belt into a machine that trains the model',
}

/** Every topic should have a motif; fall back to the most generic one. */
export function motifFor(slug: string): Motif {
  return TOPIC_MOTIFS[slug] ?? 'weights'
}
