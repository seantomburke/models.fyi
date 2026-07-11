import type { Benchmark } from './types.ts'

export const benchmarks: Benchmark[] = [
  {
    id: 'swe-bench-verified',
    name: 'SWE-bench Verified',
    eli5: 'Hands the AI bugs from actual software projects and counts how many it fixes. Like a coding job interview, but with real work.',
    unit: '%',
  },
  {
    id: 'swe-bench-pro',
    name: 'SWE-bench Pro',
    eli5: 'The harder version of the coding test. Bigger codebases, trickier bugs. Scores drop for everyone, so the gaps between models become clearer.',
    unit: '%',
  },
  {
    id: 'gpqa-diamond',
    name: 'GPQA Diamond',
    eli5: 'PhD-level science questions written so you cannot just Google the answer. Tests whether the model can reason about hard science.',
    unit: '%',
  },
  {
    id: 'terminal-bench',
    name: 'Terminal-Bench 2.1',
    eli5: 'Puts the AI in front of a computer terminal and asks it to finish multi-step tasks on its own. Measures how good an "AI agent" it is.',
    unit: '%',
  },
]
