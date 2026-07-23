import { useCallback, useEffect, useRef, useState } from 'react'
import { loadTokenSplitter, type TokenSplitter } from '../../lib/tokenize'

const COLORS = [
  '#BFDBFE', '#BBF7D0', '#FDE68A', '#FBCFE8', '#C7D2FE', '#A7F3D0', '#FECACA',
  '#DDD6FE', '#99F6E4', '#FED7AA',
]

const EXAMPLES = [
  {
    text: 'The quick brown fox',
    description: 'Common short words are one token each, and the space in front belongs to the token.',
  },
  {
    text: 'Understanding tokenization',
    description: 'Less common words split into pieces: "tokenization" is " token" + "ization".',
  },
  {
    text: 'Supercalifragilisticexpialidocious',
    description: 'The rarer the word, the more pieces it shatters into.',
  },
]

/**
 * Renders text as contiguous highlighted spans, one per real BPE token.
 * Until the tokenizer chunk loads (and during prerender), falls back to a
 * single unhighlighted span so the sentence still reads normally.
 */
function HighlightedTokens({ text, splitter }: { text: string; splitter: TokenSplitter | null }) {
  const pieces = splitter ? splitter(text) : [text]
  return (
    <p className="text-base leading-loose break-words">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="whitespace-pre-wrap py-1 cursor-help"
          style={
            splitter
              ? { backgroundColor: COLORS[i % COLORS.length], color: '#1f2937', boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.9)' }
              : undefined
          }
          title={splitter ? `Token ${i + 1}: "${piece}"` : undefined}
        >
          {piece}
        </span>
      ))}
    </p>
  )
}

export function TokenVisualization() {
  const [splitter, setSplitter] = useState<TokenSplitter | null>(null)
  const [customText, setCustomText] = useState('Type anything here to see how a model tokenizes it!')
  const containerRef = useRef<HTMLDivElement>(null)
  const requestedRef = useRef(false)
  const mountedRef = useRef(true)

  // The o200k_base ranks are a megabyte of lazy chunk, and this widget sits in
  // the last section of a long article. Fetch it only once the widget is about
  // to be seen (or the moment someone types), never on page render.
  const ensureSplitter = useCallback(() => {
    if (requestedRef.current) return
    requestedRef.current = true
    loadTokenSplitter()
      .then((s) => {
        if (mountedRef.current) setSplitter(() => s)
      })
      .catch((err) => {
        requestedRef.current = false
        console.error('tokenizer failed to load', err)
      })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    // No IntersectionObserver (SSR, jsdom, old browsers): load right away so
    // behavior never regresses to a permanently unhighlighted fallback.
    if (typeof IntersectionObserver === 'undefined') {
      ensureSplitter()
      return () => {
        mountedRef.current = false
      }
    }

    const el = containerRef.current
    if (!el) {
      ensureSplitter()
      return () => {
        mountedRef.current = false
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          ensureSplitter()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => {
      mountedRef.current = false
      observer.disconnect()
    }
  }, [ensureSplitter])

  const countLabel = (text: string) =>
    splitter ? `${splitter(text).length} tokens` : 'loading tokenizer…'

  return (
    <div ref={containerRef} className="space-y-8">
      <p className="text-sm text-fg-secondary">
        These are the real tokens computed by the o200k_base tokenizer (used by
        GPT-4o and o-series models). Each highlight is one token. Notice how a
        single word can span several colors, and how the leading space is part
        of the token.
      </p>

      {EXAMPLES.map((example) => (
        <div key={example.text} className="space-y-2">
          <h3 className="text-sm font-semibold text-fg">{example.description}</h3>
          <div className="rounded-lg border border-line bg-surface p-4">
            <HighlightedTokens text={example.text} splitter={splitter} />
            <p className="mt-2 text-sm text-fg-secondary">
              <span className="font-semibold text-fg">{countLabel(example.text)}</span>
              {' · '}{example.text.length} characters
            </p>
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <label htmlFor="tokenize-input" className="text-sm font-semibold text-fg">
          Try your own text
        </label>
        <textarea
          id="tokenize-input"
          value={customText}
          onChange={(e) => {
            ensureSplitter()
            setCustomText(e.target.value)
          }}
          rows={2}
          className="w-full rounded-lg border border-line bg-surface p-3 text-base text-fg focus:outline-none focus:ring-2 focus:ring-accent-deep"
        />
        {customText.length > 0 && (
          <div className="rounded-lg border border-line bg-surface p-4">
            <HighlightedTokens text={customText} splitter={splitter} />
            <p className="mt-2 text-sm text-fg-secondary">
              <span className="font-semibold text-fg">{countLabel(customText)}</span>
              {' · '}{customText.length} characters
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <h3 className="text-sm font-semibold text-fg mb-2">Why tokens matter</h3>
        <ul className="space-y-2 text-sm text-fg-secondary">
          <li className="flex gap-2">
            <span className="text-accent-deep">•</span>
            <span>Models charge per token. The word count is a rough guide at best.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-deep">•</span>
            <span>A token is roughly 3/4 of a word on average in English</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-deep">•</span>
            <span>Rare or made-up words break into many small pieces</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-deep">•</span>
            <span>Every token in your prompt counts toward the cost</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
