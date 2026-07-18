import { useState } from 'react'
import { usePageMeta } from '../lib/meta.ts'
import { metaFor, faqSchema } from '../lib/routeMeta.ts'
import { faqsByCategory, faqCategories } from '../data/faqs.ts'
import { Breadcrumb } from '../components/Breadcrumb.tsx'

export function FAQ() {
  const meta = metaFor('/faq')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  usePageMeta({
    title: meta.title,
    description: meta.description,
    image: meta.image,
    type: meta.type,
    pathname: '/faq',
  })

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const generateItemId = (categoryIdx: number, itemIdx: number): string => {
    return `faq-${categoryIdx}-${itemIdx}`
  }

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { name: 'Home', path: '/' },
          { name: 'FAQ' },
        ]}
        className="mb-4"
      />

      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Frequently Asked Questions</h1>
        <p className="mt-3 leading-relaxed text-fg-secondary">
          Answers to common questions about AI models, benchmarks, pricing, and how to choose the right
          model for your task.
        </p>
      </div>

      {/* Render FAQ by category */}
      {faqCategories.map((category, categoryIdx) => {
        const categoryFaqs = faqsByCategory(category)
        return (
          <section key={category} className="space-y-4">
            <h2 className="text-lg font-semibold text-fg">{category}</h2>
            <div className="space-y-2">
              {categoryFaqs.map((faq, itemIdx) => {
                const itemId = generateItemId(categoryIdx, itemIdx)
                const isExpanded = expandedItems.has(itemId)

                return (
                  <div
                    key={itemId}
                    className="rounded-lg border border-line bg-surface-raised transition-colors"
                  >
                    <button
                      id={itemId}
                      aria-expanded={isExpanded}
                      aria-controls={`${itemId}-content`}
                      onClick={() => toggleItem(itemId)}
                      className="w-full px-5 py-4 text-left font-medium text-fg transition-colors hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-accent rounded-lg flex items-center justify-between gap-3"
                    >
                      <span>{faq.question}</span>
                      <svg
                        className={`h-5 w-5 flex-shrink-0 text-fg-secondary transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </button>

                    {/* Accordion content */}
                    {isExpanded && (
                      <div
                        id={`${itemId}-content`}
                        className="border-t border-line px-5 py-4 text-fg-secondary leading-relaxed"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* JSON-LD schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqSchema(
              faqCategories.flatMap((category) =>
                faqsByCategory(category).map((faq) => ({
                  question: faq.question,
                  answer: faq.answer,
                })),
              ),
            ),
          ),
        }}
      />
    </div>
  )
}
