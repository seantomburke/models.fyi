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

export const sectionComponents: Record<string, ComponentType> = {
  'bayesian-statistics::Walk the tree': BayesTreeExplorer,
  'bayesian-statistics::The same math predicts the next word': BayesNextWord,
  'how-do-neural-network-weights-work::How they work: the multiplication': WeightedSumEquation,
}
