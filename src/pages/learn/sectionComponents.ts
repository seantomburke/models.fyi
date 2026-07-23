/**
 * Interactive section components registered outside topics.ts.
 *
 * topics.ts is reachable from src/lib/routeMeta.ts, so a `component:` there
 * bundles the component into the chunk every route preloads (the same trap
 * topicProse.ts exists to avoid). Components registered here instead ship in
 * the LearnTopic chunk, which only /learn/:slug readers download.
 *
 * Keyed by `<slug>::<section heading>`, matching topicProse.ts. LearnTopic
 * checks this map after topics.ts's own `component` field, so older topics
 * keep working unchanged.
 */
import type { ComponentType } from 'react'
import { BayesTreeExplorer } from '../../components/learn/BayesTreeExplorer'
import { BayesNextWord } from '../../components/learn/BayesNextWord'
import { WeightedSumEquation } from '../../components/learn/WeightedSumEquation'
import { ContextWindowVisualizer } from '../../components/learn/ContextWindowVisualizer'
import { HallucinationDemo } from '../../components/learn/HallucinationDemo'
import {
  ClaudeVsGeminiFaceOff,
  ClaudeVsGptFaceOff,
  GrokVsGptFaceOff,
} from '../../components/learn/ModelFaceOff'
import { TokenCostVisualizer } from '../../components/learn/TokenCostVisualizer'
import { CodingModelPicker } from './components/CodingModelPicker'
import { EmbeddingExplorer } from '../../components/learn/EmbeddingExplorer'
import { VisionCapabilityDemo } from '../../components/learn/VisionCapabilityDemo'
import { FineTuningDemo } from '../../components/learn/FineTuningDemo'
import { OpenClosedTradeoffGuide } from './components/OpenClosedTradeoffGuide'

export const sectionComponents: Record<string, ComponentType> = {
  'bayesian-statistics::Walk the tree': BayesTreeExplorer,
  'bayesian-statistics::The same math predicts the next word': BayesNextWord,
  'how-do-neural-network-weights-work::How they work: the multiplication': WeightedSumEquation,
  'hallucinations::The fundamental problem': HallucinationDemo,
  'context-window-strategies::Smart strategies': ContextWindowVisualizer,
  'model-pricing-tokens::Input vs output: the split': TokenCostVisualizer,
  "claude-vs-gpt::What they're good at": ClaudeVsGptFaceOff,
  'claude-vs-gemini::Capabilities': ClaudeVsGeminiFaceOff,
  'grok-vs-gpt::What Grok does well': GrokVsGptFaceOff,
  'best-model-for-coding::What coders need': CodingModelPicker,
  'embedding-models::Converting meaning to numbers': EmbeddingExplorer,
  'vision-models::What they can do': VisionCapabilityDemo,
  'fine-tuning-models::When to fine-tune': FineTuningDemo,
  'open-source-vs-closed-source::The practical question': OpenClosedTradeoffGuide,
}
