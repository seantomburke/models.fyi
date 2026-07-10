import { usePageMeta } from '../lib/meta.ts'

interface PlaceholderProps {
  title: string
  metaTitle: string
  description: string
}

/** Temporary stand-in for feature pages until their epics land. */
export function Placeholder({ title, metaTitle, description }: PlaceholderProps) {
  usePageMeta(metaTitle, description)
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 leading-relaxed text-fg-secondary">{description}</p>
      <p className="mt-6 rounded-lg border border-line bg-surface-raised px-4 py-3 text-sm text-fg-muted">
        This page is under construction — it's coming in an upcoming release.
      </p>
    </div>
  )
}
