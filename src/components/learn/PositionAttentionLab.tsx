import { useState } from 'react'
import { ATTENTION, END, adjustedChoices, generateSentence, positionSignal } from './positionAttentionModel'
import type { Slot } from './positionAttentionModel'

const slotNames: Record<Slot, string> = { subject: 'subject', verb: 'verb', object: 'object', end: 'period' }

function Bars({ previous, slot, temperature }: { previous: string; slot: Slot; temperature: number }) {
  const choices = adjustedChoices(previous, slot, temperature)
  return <div className="space-y-2" aria-label={`${slotNames[slot]} predictions`}>
    {choices.map((choice) => <div key={choice.word} className="flex items-center gap-3 text-sm">
      <span className="w-16 font-medium">{choice.word === END ? '.' : choice.word}</span>
      <span className="h-3 grow overflow-hidden rounded-full bg-accent-soft"><span className="block h-full rounded-full bg-accent-deep/70" style={{ width: `${choice.prob * 100}%` }} /></span>
      <span className="w-10 text-right text-xs text-fg-secondary">{Math.round(choice.prob * 100)}%</span>
    </div>)}
  </div>
}

export function PositionAttentionLab() {
  const [subject, setSubject] = useState<'Bob' | 'Alice'>('Bob')
  const [mode, setMode] = useState<'greedy' | 'sample'>('greedy')
  const [temperature, setTemperature] = useState(0.8)
  const [sentence, setSentence] = useState<string[]>(['Bob', 'ignores', 'Alice'])
  const updateSubject = (value: 'Bob' | 'Alice') => {
    setSubject(value)
    setSentence([value, value === 'Bob' ? 'ignores' : 'greets', value === 'Bob' ? 'Alice' : 'Bob'])
  }
  const generate = () => setSentence(generateSentence(temperature, mode === 'sample'))
  return <div className="space-y-6">
    <section className="rounded-lg border border-line bg-surface p-4" aria-labelledby="position-heading">
      <h3 id="position-heading" className="text-sm font-semibold text-fg">One word, two positions</h3>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Choose a subject">
        {(['Bob', 'Alice'] as const).map((word) => <button key={word} type="button" onClick={() => updateSubject(word)} aria-pressed={subject === word} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-line-strong">{word} as subject</button>)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded border border-line p-3"><strong>{subject} at subject</strong><p className="mt-1 text-fg-secondary">Position signal {positionSignal('subject')}. The friendly meaning points to the matching verb.</p><Bars previous={subject} slot="subject" temperature={1} /></div>
        <div className="rounded border border-line p-3"><strong>{subject} at object</strong><p className="mt-1 text-fg-secondary">Position signal {positionSignal('object')}. The next token is the period.</p><Bars previous={subject} slot="object" temperature={1} /></div>
      </div>
    </section>
    <section className="rounded-lg border border-line bg-surface p-4" aria-labelledby="attention-heading">
      <h3 id="attention-heading" className="text-sm font-semibold text-fg">A small attention head looks back</h3>
      <p className="mt-2 text-sm text-fg-secondary">For the object slot in “Bob ignores”, the query gives more weight to Bob. That carries the subject role forward before the model picks an object.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {ATTENTION.map((item) => <div key={item.token} className="rounded border border-line p-3 text-sm"><div className="flex justify-between"><strong>{item.token}</strong><span>{Math.round(item.weight * 100)}% attention</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-accent-soft"><div className="h-full rounded-full bg-accent-deep/70" style={{ width: `${item.weight * 100}%` }} /></div><p className="mt-2 text-fg-secondary">key {item.key}, value {item.value}</p></div>)}
      </div>
    </section>
    <section className="rounded-lg border border-line bg-surface p-4" aria-labelledby="generator-heading">
      <h3 id="generator-heading" className="text-sm font-semibold text-fg">Generate a sentence</h3>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setMode('greedy')} aria-pressed={mode === 'greedy'} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium">Greedy</button>
        <button type="button" onClick={() => setMode('sample')} aria-pressed={mode === 'sample'} className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium">Sample</button>
        <label className="flex items-center gap-2 text-sm">Temperature <input type="range" min="0.3" max="1.5" step="0.1" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /><span>{temperature.toFixed(1)}</span></label>
        <button type="button" onClick={generate} className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white">Generate</button>
      </div>
      <p className="mt-4 text-lg font-medium" data-testid="generated-sentence">{sentence.join(' ')}.</p>
      <p className="mt-2 text-sm text-fg-secondary">Greedy chooses the top bar. Sample draws from the bars, and temperature spreads or concentrates those chances.</p>
    </section>
  </div>
}
