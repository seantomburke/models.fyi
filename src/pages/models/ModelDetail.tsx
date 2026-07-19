import { Link, useParams } from 'react-router-dom'
import { models } from '../../data/models'
import { benchmarks, providers } from '../../data'
import type { Model } from '../../data/types'
import { usePageMeta } from '../../lib/meta'
import { metaFor } from '../../lib/routeMeta'
import { ModelHeader } from '../../components/models/ModelHeader'
import { ModelSpecs } from '../../components/models/ModelSpecs'
import { ModelBenchmarks } from '../../components/models/ModelBenchmarks'
import { UseCasesSection } from '../../components/models/UseCasesSection'
import { ProsCons } from '../../components/models/ProsCons'
import { RelatedModels } from '../../components/models/RelatedModels'
import { NotFound } from '../NotFound'

export function ModelDetail() {
  const { id } = useParams<{ id: string }>()
  const model = models.find((m) => m.id === id)

  if (!model) {
    return <NotFound />
  }

  return <ModelDetailContent model={model} />
}

function ModelDetailContent({ model }: { model: Model }) {
  const provider = providers.find((p) => p.id === model.providerId)
  const relevantBenchmarks = benchmarks.filter((b) => model.scores[b.id] !== undefined)

  const meta = metaFor(`/models/${model.id}`)
  usePageMeta({
    title: meta.title,
    description: meta.description,
    type: meta.type,
    image: meta.image,
    pathname: `/models/${model.id}`,
    structuredData: meta.structuredData,
  })

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <ModelHeader model={model} provider={provider} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ModelSpecs model={model} relevantBenchmarks={relevantBenchmarks} />

          {model.useCases && model.useCases.length > 0 && (
            <UseCasesSection useCases={model.useCases} />
          )}
        </div>

        {relevantBenchmarks.length > 0 && (
          <ModelBenchmarks model={model} benchmarks={relevantBenchmarks} />
        )}

        {model.whyChooseThis && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose {model.name}?
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {model.whyChooseThis}
            </p>
          </section>
        )}

        {model.prosVsCompetitors && Object.keys(model.prosVsCompetitors).length > 0 && (
          <ProsCons prosVsCompetitors={model.prosVsCompetitors} />
        )}

        <RelatedModels currentModelId={model.id} />

        <nav
          aria-label="Compare links"
          className="flex flex-wrap gap-x-6 gap-y-2 pt-8 border-t border-slate-200 dark:border-slate-700"
        >
          {provider && (
            <Link
              to={`/compare?filter=${model.providerId}`}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Compare all {provider.name} models →
            </Link>
          )}
          <Link
            to="/compare"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Compare every model →
          </Link>
        </nav>
      </div>
    </main>
  )
}
