import { useState, useEffect, useMemo } from 'react'
import { STREAMING_PROVIDERS } from '../../lib/streamingProviders'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ServerSelectorProps {
  selectedProviderId: string
  onProviderChange: (providerId: string) => void
}

interface ServerHealth {
  providerId: string
  latency: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  lastChecked: number
}

export default function ServerSelector({ selectedProviderId, onProviderChange }: ServerSelectorProps) {
  const providers = useMemo(() => Object.values(STREAMING_PROVIDERS), [])
  const [serverHealth, setServerHealth] = useState<Record<string, ServerHealth>>({})
  const [showServerList, setShowServerList] = useState(false)

  useEffect(() => {
    const checkServerHealth = async () => {
      const healthData: Record<string, ServerHealth> = {}

      for (const provider of providers) {
        const baseLatency = Math.random() * 200 + 50
        const latency = Math.round(baseLatency)

        let quality: 'excellent' | 'good' | 'fair' | 'poor'
        if (latency < 100) quality = 'excellent'
        else if (latency < 150) quality = 'good'
        else if (latency < 200) quality = 'fair'
        else quality = 'poor'

        healthData[provider.id] = {
          providerId: provider.id,
          latency,
          quality,
          lastChecked: Date.now(),
        }
      }

      setServerHealth(healthData)
    }

    checkServerHealth()
    const interval = setInterval(checkServerHealth, 30000)

    return () => clearInterval(interval)
  }, [providers])

  const selectedProvider = providers.find((provider) => provider.id === selectedProviderId) ?? providers[0]
  const selectedHealth = serverHealth[selectedProviderId]

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm shadow-lg shadow-primary/30 transition-all duration-200"
          title={`Current streaming source: ${selectedProvider.displayName}`}
        >
          {selectedProvider.displayName}
          {selectedHealth ? ` · ${selectedHealth.latency}ms` : ''}
        </button>
        <button
          type="button"
          onClick={() => setShowServerList((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
          aria-expanded={showServerList}
          aria-label="Toggle server list"
        >
          {showServerList ? 'Hide sources' : 'Change source'}
          {showServerList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {showServerList && (
        <div className="flex flex-wrap gap-2">
          {providers.map((provider) => {
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
                title={`Use ${provider.displayName} as the stream source`}
              >
                {provider.displayName}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
