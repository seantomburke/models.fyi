import type { Benchmark } from './types.ts'

/**
 * Only benchmarks with published scores in models.ts belong here — every
 * entry becomes a Compare-page column, and the validator rejects columns
 * no model has data for. (2026-07-19: dropped 16 score-less definitions;
 * re-add one only together with its first scores.)
 */
export const benchmarks: Benchmark[] = [
  {
    id: 'swe-bench-verified',
    name: 'SWE-bench Verified',
    eli5: 'Hands the AI bugs from actual software projects and counts how many it fixes. Like a coding job interview, but with real work.',
    unit: '%',
    category: 'Software Engineering',
    sourceUrl: 'https://github.com/princeton-nlp/SWE-bench',
    confidence: 'independent',
    sourceOrganization: 'Princeton NLP',
  },
  {
    id: 'swe-bench-pro',
    name: 'SWE-bench Pro',
    eli5: 'The harder version of the coding test. Bigger codebases, trickier bugs. Scores drop for everyone, so the gaps between models become clearer.',
    unit: '%',
    category: 'Software Engineering',
    sourceUrl: 'https://github.com/princeton-nlp/SWE-bench',
    confidence: 'independent',
    sourceOrganization: 'Princeton NLP',
  },
  {
    id: 'gpqa-diamond',
    name: 'GPQA Diamond',
    eli5: 'PhD-level science questions written so you cannot just Google the answer. Tests whether the model can reason about hard science.',
    unit: '%',
    category: 'Knowledge',
    sourceUrl: 'https://huggingface.co/datasets/Idavidrein/gpqa',
    confidence: 'independent',
    sourceOrganization: 'Hugging Face',
  },
  {
    id: 'terminal-bench',
    name: 'Terminal-Bench 2.1',
    eli5: 'Puts the AI in front of a computer terminal and asks it to finish multi-step tasks on its own. Measures how good an "AI agent" it is.',
    unit: '%',
    category: 'Software Engineering',
    sourceUrl: 'https://github.com/aime-bench/aime-bench',
    confidence: 'independent',
    sourceOrganization: 'AIME Bench',
  },
  {
    id: 'hle',
    name: "Humanity's Last Exam",
    eli5: 'PhD-level questions across many subjects. Tests deep reasoning on the hardest questions humans can ask.',
    unit: '%',
    category: 'Knowledge',
    sourceUrl: 'https://scale.com/leaderboard/humanitys_last_exam',
    confidence: 'independent',
    sourceOrganization: 'Scale AI',
  },
]
