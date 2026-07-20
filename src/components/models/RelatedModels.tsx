import { Link } from 'react-router-dom'
import { models } from '../../data/models'
import { providers } from '../../data'
import { ProviderLogo } from '../ProviderLogo'
import { getRecommendedModels } from '../../lib/recommendations'

interface Props {
  currentModelId: string
}

export function RelatedModels({ currentModelId }: Props) {
  const currentModel = models.find((m) => m.id === currentModelId)

  if (!currentModel) {
    return null
  }

  const related = getRecommendedModels(currentModel, models)

  if (related.length === 0) {
    return null
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-fg mb-6">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((model) => {
          const provider = providers.find((p) => p.id === model.providerId)
          return (
            <Link
              key={model.id}
              to={`/models/${model.id}`}
              className="block p-4 border border-line rounded-lg hover:border-line-strong transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                {provider && <ProviderLogo providerId={provider.id} size={16} />}
                <h3 className="font-semibold text-fg">{model.name}</h3>
              </div>
              <p className="text-sm text-fg-muted">{model.blurb}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
