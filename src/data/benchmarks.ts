import type { Benchmark } from './types.ts'

export const benchmarks: Benchmark[] = [
  {
    id: 'swe-bench-verified',
    name: 'SWE-bench Verified',
    eli5: 'Hands the AI real bugs from real software projects and counts how many it actually fixes. Like a coding job interview, but with real work.',
    unit: '%',
  },
  {
    id: 'swe-bench-pro',
    name: 'SWE-bench Pro',
    eli5: 'The harder version of the coding test: bigger codebases, trickier bugs. Scores drop for everyone — the gaps between models get more honest.',
    unit: '%',
  },
  {
    id: 'gpqa-diamond',
    name: 'GPQA Diamond',
    eli5: 'PhD-level science questions written so you cannot just Google the answer. Tests whether the model can really reason about hard science.',
    unit: '%',
  },
  {
    id: 'terminal-bench',
    name: 'Terminal-Bench 2.1',
    eli5: 'Puts the AI in front of a computer terminal and asks it to finish multi-step tasks on its own. Measures how good an "AI agent" it is.',
    unit: '%',
  },
  {
    id: 'mmlu',
    name: 'MMLU',
    eli5: 'A giant general-knowledge exam across 57 subjects, from law to biology. Top models all ace it now, so small differences here mean little.',
    unit: '%',
  },
]
