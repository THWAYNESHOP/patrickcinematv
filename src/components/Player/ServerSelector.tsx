import { STREAMING_PROVIDERS } from '../../lib/streamingProviders'

interface ServerSelectorProps {
  selectedProviderId: string
  onProviderChange: (providerId: string) => void
}

export default function ServerSelector({ selectedProviderId, onProviderChange }: ServerSelectorProps) {
  const providers = Object.values(STREAMING_PROVIDERS)
  const serverNumbers = ['1', '2', '3']

  return (
    <div className="flex gap-2">
      {providers.map((provider, index) => {
        const isSelected = selectedProviderId === provider.id
        return (
          <button
            key={provider.id}
            onClick={() => onProviderChange(provider.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              isSelected
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Server {serverNumbers[index] || index + 1} ({provider.displayName})
          </button>
        )
      })}
    </div>
  )
}
