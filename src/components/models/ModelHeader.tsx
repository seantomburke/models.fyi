import type { Model, Provider } from '../../data/types'
import { ProviderLogo } from '../ProviderLogo'

interface Props {
  model: Model
  provider?: Provider
}

export function ModelHeader({ model, provider }: Props) {
  return (
    <div className="border-b border-line pb-8">
      <div className="flex flex-wrap items-start gap-4 mb-4">
        {provider && (
          <div className="flex-shrink-0">
            <ProviderLogo providerId={provider.id} size={32} />
          </div>
        )}
        <div className="flex-1 min-w-48">
          <h1 className="text-4xl font-bold text-fg mb-2">
            {model.name}
          </h1>
          {provider && (
            <p className="text-lg text-fg-muted">{provider.name}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {model.reasoning && (
            <span className="whitespace-nowrap px-3 py-1 bg-accent-soft text-accent-deep rounded-md text-sm font-medium">
              🧠 Reasoning
            </span>
          )}
          {model.internetAccess && (
            <span className="whitespace-nowrap px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md text-sm font-medium">
              🌐 Web Search
            </span>
          )}
        </div>
      </div>
      <p className="text-lg text-fg-secondary">{model.blurb}</p>
    </div>
  )
}
