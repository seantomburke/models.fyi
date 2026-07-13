import { models, providerById } from '../data/index.ts'
import type { Model, ProviderId } from '../data/index.ts'
import { withArticle } from './format.ts'

// ─── Quiz vocabulary ───────────────────────────────────────────

export interface RoleNeeds {
  precision?: boolean
  creative?: boolean
  simple?: boolean
}

export interface Role {
  id: string
  label: string
  /** Person-noun for prose ("customer support agent"), since labels name job functions. */
  person: string
  emoji: string
  needs?: RoleNeeds
}

export const roles: Role[] = [
  { id: 'engineer', label: 'Software engineer', person: 'software engineer', emoji: '🧑‍💻', needs: { precision: true } },
  { id: 'marketer', label: 'Marketer', person: 'marketer', emoji: '📣', needs: { creative: true } },
  { id: 'writer', label: 'Writer', person: 'writer', emoji: '✍️', needs: { creative: true } },
  { id: 'student', label: 'Student', person: 'student', emoji: '🎓' },
  { id: 'researcher', label: 'Researcher / analyst', person: 'researcher or analyst', emoji: '🔬', needs: { precision: true } },
  { id: 'everyday', label: 'Everyday curious person', person: 'everyday curious person', emoji: '🙋', needs: { simple: true } },
  { id: 'designer', label: 'Designer', person: 'designer', emoji: '🎨', needs: { creative: true } },
  { id: 'sales', label: 'Sales professional', person: 'sales professional', emoji: '💼', needs: { simple: true } },
  { id: 'support', label: 'Customer support', person: 'customer support agent', emoji: '💬', needs: { simple: true } },
  { id: 'hr', label: 'HR / People ops', person: 'HR professional', emoji: '👥', needs: { simple: true } },
  { id: 'finance', label: 'Finance / Accounting', person: 'finance professional', emoji: '💰', needs: { precision: true } },
  { id: 'legal', label: 'Legal / Compliance', person: 'legal professional', emoji: '⚖️', needs: { precision: true } },
  { id: 'operations', label: 'Operations / Logistics', person: 'operations professional', emoji: '🚚', needs: { simple: true } },
  { id: 'product', label: 'Product management', person: 'product manager', emoji: '🎯', needs: { creative: true } },
  { id: 'healthcare', label: 'Healthcare / Medical', person: 'healthcare professional', emoji: '⚕️', needs: { precision: true } },
  { id: 'educator', label: 'Teacher / Educator', person: 'teacher', emoji: '📖', needs: { simple: true } },
  { id: 'executive', label: 'Executive / Founder', person: 'executive or founder', emoji: '🏢' },
]

export interface TaskNeeds {
  coding?: boolean
  science?: boolean
  agentic?: boolean
  internet?: boolean
  longContext?: boolean
  /** Simple/high-volume work where speed and price beat raw capability. */
  simple?: boolean
}

export interface Task {
  id: string
  label: string
  emoji: string
  needs: TaskNeeds
}

export const tasks: Task[] = [
  { id: 'build-app', label: 'Build an app', emoji: '🏗️', needs: { coding: true, agentic: true } },
  { id: 'fix-bug', label: 'Fix a bug', emoji: '🐛', needs: { coding: true } },
  { id: 'write-email', label: 'Write emails & short posts', emoji: '📨', needs: { simple: true } },
  { id: 'write-book', label: 'Write something long', emoji: '📚', needs: { longContext: true } },
  { id: 'research', label: 'Research current topics', emoji: '🌐', needs: { internet: true } },
  { id: 'hard-problem', label: 'Solve a hard technical problem', emoji: '🧮', needs: { science: true } },
  { id: 'summarize', label: 'Summarize big documents', emoji: '🗜️', needs: { longContext: true, simple: true } },
  { id: 'chat-learn', label: 'Chat and learn things', emoji: '💬', needs: { simple: true } },
  { id: 'code-review', label: 'Review code', emoji: '🔍', needs: { coding: true } },
  { id: 'data-analysis', label: 'Analyze data', emoji: '📊', needs: { science: true } },
  { id: 'translate', label: 'Translate text', emoji: '🌍', needs: { simple: true } },
  { id: 'meeting-notes', label: 'Transcribe & organize meeting notes', emoji: '📝', needs: { longContext: true, simple: true } },
  { id: 'brainstorm', label: 'Brainstorm ideas', emoji: '💡', needs: { simple: true } },
  { id: 'doc-review', label: 'Review contracts or documents', emoji: '📋', needs: { longContext: true } },
  { id: 'customer-draft', label: 'Draft customer support responses', emoji: '✉️', needs: { simple: true } },
  { id: 'planning', label: 'Schedule and plan work', emoji: '📅', needs: { simple: true } },
]

export type Budget = 'free' | 'value' | 'premium'

export const budgets: Array<{ id: Budget; label: string; blurb: string }> = [
  { id: 'free', label: 'Free / open source', blurb: 'Models I can download and run myself' },
  { id: 'value', label: 'Good value', blurb: 'Cheap but capable' },
  { id: 'premium', label: 'Best possible', blurb: 'Cost is not the concern' },
]

export type CompanyPref = 'any' | 'open-source' | ProviderId

export const companyPrefs: Array<{ id: CompanyPref; label: string }> = [
  { id: 'any', label: 'No preference' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'google', label: 'Google' },
  { id: 'xai', label: 'xAI' },
  { id: 'meta', label: 'Meta' },
  { id: 'open-source', label: 'Open source' },
]

// ─── Recommendation engine ─────────────────────────────────────

export interface Recommendation {
  pick: Model
  runnerUp?: Model
  /** Plain-language reasons behind the pick, in display order. */
  why: string[]
}

const avgScore = (m: Model): number => {
  const s = Object.values(m.scores)
  return s.length > 0 ? s.reduce((a, b) => a + b, 0) / s.length : 0
}

const tierRank: Record<Model['tier'], number> = { flagship: 3, balanced: 2, fast: 1 }

/**
 * Price used for ranking when a model has no list price (open source).
 * Self-hosting isn't free in practice, so unless the user explicitly chose
 * open source we treat it as mid-priced rather than $0.
 */
const rankingPrice = (m: Model): number => m.inputPricePerMTok ?? 3

function capabilityScore(m: Model, needs: TaskNeeds): number {
  if (needs.coding) {
    return m.scores['swe-bench-pro'] ?? m.scores['swe-bench-verified'] ?? tierRank[m.tier] * 20
  }
  if (needs.science) {
    return m.scores['gpqa-diamond'] ?? tierRank[m.tier] * 20
  }
  if (needs.agentic) {
    return m.scores['terminal-bench'] ?? tierRank[m.tier] * 20
  }
  const avg = avgScore(m)
  return avg > 0 ? avg : tierRank[m.tier] * 20
}

export function recommend(role: Role, task: Task, budget: Budget, pref: CompanyPref): Recommendation {
  const why: string[] = []
  const needs = { ...task.needs }

  // Merge role bias into needs (task needs take priority over role bias)
  if (role.needs?.precision && !needs.science && !needs.coding) {
    needs.science = true
  }
  if (role.needs?.simple && !needs.internet && !needs.longContext && !needs.agentic) {
    needs.simple = true
  }

  // 1. Company preference.
  let pool = models
  if (pref === 'open-source') {
    pool = pool.filter((m) => m.openSource)
    why.push('You asked for open source, so every option here is free to download and run.')
  } else if (pref !== 'any') {
    pool = pool.filter((m) => m.providerId === pref)
    const name = providerById.get(pref)?.name ?? pref
    why.push(`Limited to ${name} models, as you asked.`)
  }

  // 2. Budget.
  if (budget === 'free' && pref !== 'open-source') {
    const openPool = pool.filter((m) => m.openSource)
    if (openPool.length > 0) {
      pool = openPool
      why.push('“Free / open source” means models you download and run yourself, with no per-token bills.')
    } else {
      why.push(
        'That company has no open-source models, so this is its cheapest option instead of a free one.',
      )
      pool = [...pool].sort((a, b) => (a.inputPricePerMTok ?? 0) - (b.inputPricePerMTok ?? 0))
    }
  }

  // 3. The internet rule.
  if (needs.internet) {
    const connected = pool.filter((m) => m.internetAccess)
    if (connected.length > 0) {
      pool = connected
      why.push(
        'This task needs live information. Models don’t know anything after their training ended, so you want one whose assistant can search the web.',
      )
    } else {
      pool = models.filter((m) => m.internetAccess)
      why.push(
        'Heads up: open-source models you run yourself can’t search the web out of the box, and this task needs live information, so we picked an affordable connected model instead.',
      )
    }
  }

  // 4. Long context.
  if (needs.longContext) {
    const sorted = [...pool].sort(
      (a, b) => (b.contextWindowTokens ?? 0) - (a.contextWindowTokens ?? 0),
    )
    const cutoff = Math.max(2, Math.ceil(sorted.length / 2))
    pool = sorted.slice(0, cutoff)
    why.push(
      'Long writing and big documents need a big context window, the model’s “working memory” for text.',
    )
  }

  // 5. Rank what's left.
  const value = budget !== 'premium' || needs.simple
  const ranked = [...pool].sort((a, b) => {
    if (needs.simple && !needs.longContext) {
      // Cheap + fast wins for simple work; capability is a tiebreaker.
      const priceA = rankingPrice(a)
      const priceB = rankingPrice(b)
      if (priceA !== priceB) return priceA - priceB
      return capabilityScore(b, needs) - capabilityScore(a, needs)
    }
    const capA = capabilityScore(a, needs)
    const capB = capabilityScore(b, needs)
    if (value) {
      // Capability per dollar.
      const perDollarA = capA / Math.max(rankingPrice(a), 1)
      const perDollarB = capB / Math.max(rankingPrice(b), 1)
      if (perDollarA !== perDollarB) return perDollarB - perDollarA
    }
    return capB - capA
  })

  const pick = ranked[0]
  const runnerUp = ranked[1]

  // 6. Role context.
  if (role.needs?.precision && (needs.science || needs.coding)) {
    why.push(
      `As ${withArticle(role.person)}, we prioritized accuracy and reasoning ability over raw speed.`,
    )
  }

  // 7. Explain the winner.
  if (needs.coding && (pick.scores['swe-bench-pro'] ?? pick.scores['swe-bench-verified'])) {
    why.push(
      `${pick.name} posts one of the strongest published scores on real-world coding tests among your options.`,
    )
  }
  if (needs.science && pick.scores['gpqa-diamond']) {
    why.push(`${pick.name} scores ${pick.scores['gpqa-diamond']}% on PhD-level science questions.`)
  }
  if (needs.simple) {
    why.push(
      `Simple tasks don’t need a premium model. ${pick.name} is fast and costs a fraction of the flagships.`,
    )
  }
  if (pick.reasoning && (needs.coding || needs.science || needs.agentic)) {
    why.push(
      `It’s a “reasoning” model: it thinks through hard problems step by step before answering, which matters for work like this.`,
    )
  } else if (!pick.reasoning) {
    why.push(
      `It answers directly without a step-by-step thinking phase, which keeps it fast and works fine for this kind of task.`,
    )
  }
  if (budget === 'premium' && !needs.simple) {
    why.push('You said cost isn’t the concern, so this leans toward maximum capability.')
  }

  return { pick, runnerUp, why }
}

// ─── Reverse flow: model → what it's for ──────────────────────

export interface ModelProfile {
  goodFor: string[]
  audience: string[]
  caveats: string[]
}

export function profileModel(m: Model): ModelProfile {
  const goodFor: string[] = []
  const audience: string[] = []
  const caveats: string[] = []

  const swe = m.scores['swe-bench-pro'] ?? m.scores['swe-bench-verified']
  if (swe !== undefined && swe >= 60) {
    goodFor.push('Serious coding: building apps, fixing bugs in real codebases')
    audience.push('Software engineers')
  }
  if ((m.scores['gpqa-diamond'] ?? 0) >= 90) {
    goodFor.push('Hard technical and scientific questions')
    audience.push('Researchers and analysts')
  }
  if ((m.scores['terminal-bench'] ?? 0) >= 80) {
    goodFor.push('Agent work: multi-step tasks it completes on its own')
  }
  if ((m.contextWindowTokens ?? 0) >= 2_000_000) {
    goodFor.push('Huge documents, since its context window fits several books at once')
    audience.push('Anyone working with long documents')
  }
  if (m.tier === 'fast') {
    goodFor.push('Quick everyday tasks in bulk: emails, summaries, chat')
    audience.push('Everyday users and high-volume apps')
  }
  if (m.tier === 'flagship' && goodFor.length === 0) {
    goodFor.push('Demanding general-purpose work')
  }
  if (m.tier === 'balanced' && goodFor.length === 0) {
    goodFor.push('Everyday work at a sensible price, with most of the flagship ability for much less')
    audience.push('Most people, most of the time')
  }
  if (m.openSource) {
    goodFor.push('Running privately on your own hardware, free of per-token costs')
    audience.push('Developers and companies that want control')
    caveats.push('No built-in web access when self-hosted. It only knows its training data.')
  }
  if (!m.reasoning) {
    caveats.push('Answers directly without a thinking phase, so very hard multi-step problems aren’t its strength.')
  }
  if ((m.inputPricePerMTok ?? 0) >= 5) {
    caveats.push('Premium pricing. Overkill for simple everyday tasks.')
  }
  if (audience.length === 0) {
    audience.push('General users')
  }
  return { goodFor, audience, caveats }
}
