import { budgets, companyPrefs, profileModel, recommend, roles, tasks } from './quiz'
import { models } from '../data/index.ts'

const role = (id: string) => roles.find((r) => r.id === id)!
const task = (id: string) => tasks.find((t) => t.id === id)!

test('every quiz path ends in a recommendation with reasons', () => {
  for (const r of roles) {
    for (const t of tasks) {
      for (const b of budgets) {
        for (const c of companyPrefs) {
          const rec = recommend(r, t, b.id, c.id)
          expect(rec.pick, `${r.id}/${t.id}/${b.id}/${c.id} produced no pick`).toBeDefined()
          expect(rec.why.length, `${r.id}/${t.id}/${b.id}/${c.id} has no reasons`).toBeGreaterThan(0)
        }
      }
    }
  }
})

test('tasks needing live data only recommend internet-capable models', () => {
  for (const b of budgets) {
    for (const c of companyPrefs) {
      const rec = recommend(role('everyday'), task('research'), b.id, c.id)
      expect(rec.pick.internetAccess, `${b.id}/${c.id} picked offline ${rec.pick.name}`).toBe(true)
    }
  }
})

test('open-source preference + research explains why open source does not fit', () => {
  const rec = recommend(role('researcher'), task('research'), 'free', 'open-source')
  expect(rec.pick.internetAccess).toBe(true)
  expect(rec.why.join(' ')).toMatch(/live information/i)
})

test('free budget lands on an open-source model when no company is forced', () => {
  const rec = recommend(role('engineer'), task('fix-bug'), 'free', 'any')
  expect(rec.pick.openSource).toBe(true)
})

test('premium coding lands on a top coding model', () => {
  const rec = recommend(role('engineer'), task('build-app'), 'premium', 'any')
  const score = rec.pick.scores['swe-bench-pro'] ?? rec.pick.scores['swe-bench-verified'] ?? 0
  const bestScore = Math.max(
    ...models.map((m) => m.scores['swe-bench-pro'] ?? m.scores['swe-bench-verified'] ?? 0),
  )
  expect(score).toBe(bestScore)
})

test('a sparsely-benchmarked model does not outrank a well-measured one', () => {
  // Scores are averaged as a delta against each benchmark's field average.
  // A plain mean would rank Llama 4 Maverick (measured only on GPQA) above
  // GLM-5.2, which carries four scores including hard ones that drag a raw
  // mean down.
  const rec = recommend(role('marketer'), task('write-email'), 'free', 'open-source')
  expect(rec.pick.id).toBe('glm-5-2')
})

test('premium open-ended work picks a flagship, not a budget tier', () => {
  const rec = recommend(role('writer'), task('write-book'), 'premium', 'any')
  expect(rec.pick.tier).toBe('flagship')
})

test('simple tasks favor cheap models over flagships', () => {
  const rec = recommend(role('everyday'), task('write-email'), 'value', 'any')
  expect(rec.pick.tier).not.toBe('flagship')
})

test('company preference is respected', () => {
  const rec = recommend(role('engineer'), task('fix-bug'), 'premium', 'anthropic')
  expect(rec.pick.providerId).toBe('anthropic')
})

test('reverse flow produces a profile for every model', () => {
  for (const m of models) {
    const profile = profileModel(m)
    expect(profile.goodFor.length, `${m.id} has no goodFor`).toBeGreaterThan(0)
    expect(profile.audience.length, `${m.id} has no audience`).toBeGreaterThan(0)
  }
})

test('non-reasoning models carry a reasoning caveat', () => {
  const llama = models.find((m) => m.id === 'llama-4-maverick')!
  const profile = profileModel(llama)
  expect(profile.caveats.join(' ')).toMatch(/without a thinking phase/i)
})

test('precision roles (legal, finance, researcher) mention accuracy focus in why', () => {
  for (const roleId of ['legal', 'finance', 'researcher']) {
    const rec = recommend(role(roleId), task('data-analysis'), 'value', 'any')
    const why = rec.why.join(' ')
    expect(why, `${roleId} should mention accuracy`).toMatch(/accuracy|precision/i)
  }
})

test('simple tasks work with all new role/task combos', () => {
  for (const newTask of ['translate', 'brainstorm', 'planning', 'customer-draft']) {
    const rec = recommend(role('support'), task(newTask), 'value', 'any')
    expect(rec.pick, `${newTask} produced no recommendation`).toBeDefined()
  }
})

test('existing task/budget/pref behavior unchanged when role has no bias', () => {
  const everyday = role('everyday')
  const coding = task('fix-bug')
  const rec = recommend(everyday, coding, 'premium', 'anthropic')
  expect(rec.pick.providerId).toBe('anthropic')
  expect(rec.why.length).toBeGreaterThan(0)
})
