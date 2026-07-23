import { useEffect } from 'react'
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
import { ModelReleaseHistory } from '../../components/models/ModelReleaseHistory'
import { RelatedModels } from '../../components/models/RelatedModels'
import { Breadcrumb } from '../../components/Breadcrumb'
import { NotFound } from '../NotFound'
import { capture } from '../../lib/analytics'

export function ModelDetail() {
  const { id } = useParams<{ id: string }>()
  const model = models.find((m) => m.id === id)

  if (!model) {
    return <NotFound />
  }

  return <ModelDetailContent model={model} />
}

function formatReleaseDate(date: string): string {
  // ISO dates parse as UTC midnight; format in UTC so the day never shifts.
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
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

  useEffect(() => {
    capture('model_detail_viewed', {
      model_id: model.id,
      provider_id: model.providerId,
      benchmark_count: relevantBenchmarks.length,
      is_open_source: model.openSource,
    })
  }, [model.id, model.openSource, model.providerId, relevantBenchmarks.length])

  return (
    <div className="mx-auto max-w-4xl space-y-12">
        {/* Tailwind v4's space-y sets margin-bottom via a zero-specificity
            :where() rule, so any mb-* here overrides the 3rem rhythm outright.
            The old -mb-8 therefore became margin-bottom: -2rem and pulled the
            title up over the breadcrumb (#97). */}
        <Breadcrumb
          items={[
            { name: 'Home', path: '/' },
            { name: 'Models', path: '/models' },
            { name: model.name },
          ]}
          className="mb-4"
        />

        <ModelHeader model={model} provider={provider} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {model.releaseDate && (
              <p className="text-sm text-fg-muted">
                Released {formatReleaseDate(model.releaseDate)}
              </p>
            )}
            <ModelSpecs model={model} relevantBenchmarks={relevantBenchmarks} />
          </div>

          {model.useCases && model.useCases.length > 0 && (
            <UseCasesSection useCases={model.useCases} />
          )}
        </div>

        {relevantBenchmarks.length > 0 && (
          <ModelBenchmarks model={model} benchmarks={relevantBenchmarks} />
        )}

        {model.whyChooseThis && (
          <section>
            <h2 className="mb-4 text-2xl font-bold text-fg">
              Why Choose {model.name}?
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-fg-secondary">
              {model.whyChooseThis}
            </p>
          </section>
        )}

        {model.prosVsCompetitors && Object.keys(model.prosVsCompetitors).length > 0 && (
          <ProsCons prosVsCompetitors={model.prosVsCompetitors} />
        )}

        <ModelReleaseHistory modelId={model.id} />

        <RelatedModels currentModelId={model.id} />

        <nav
          aria-label="Compare links"
          className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-8"
        >
          {provider && (
            <Link
              to={`/compare?filter=${model.providerId}`}
              data-attr="model-compare-provider-link"
              onClick={() => capture('model_compare_clicked', {
                model_id: model.id,
                destination: 'provider',
              })}
              className="text-sm font-medium text-accent-deep hover:underline"
            >
              Compare all {provider.name} models →
            </Link>
          )}
          <Link
            to="/compare"
            data-attr="model-compare-all-link"
            onClick={() => capture('model_compare_clicked', {
              model_id: model.id,
              destination: 'all',
            })}
            className="text-sm font-medium text-accent-deep hover:underline"
          >
            Compare every model →
          </Link>
        </nav>
    </div>
  )
}
