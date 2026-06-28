import { useState, useEffect } from 'react'
import { STREAMING_PROVIDERS, DEFAULT_PROVIDER, getProviderUrl, type StreamingProvider } from '../lib/streamingProviders'

const STORAGE_KEY = 'lastSelectedProvider'

export function useStreamingProvider() {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(DEFAULT_PROVIDER)

  // Load last selected provider from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && STREAMING_PROVIDERS[saved]) {
      setSelectedProviderId(saved)
    }
  }, [])

  // Save selected provider to localStorage when it changes
  const setProvider = (providerId: string) => {
    if (STREAMING_PROVIDERS[providerId]) {
      setSelectedProviderId(providerId)
      localStorage.setItem(STORAGE_KEY, providerId)
    }
  }

  const getProvider = (): StreamingProvider => {
    return STREAMING_PROVIDERS[selectedProviderId] || STREAMING_PROVIDERS[DEFAULT_PROVIDER]
  }

  const getEmbedUrl = (
    type: 'movie' | 'tv',
    tmdbId: string | number,
    season?: number,
    episode?: number,
    params?: Record<string, string | number | boolean>
  ): string => {
    return getProviderUrl(selectedProviderId, type, tmdbId, season, episode, params)
  }

  const getAllProviders = (): StreamingProvider[] => {
    return Object.values(STREAMING_PROVIDERS)
  }

  return {
    selectedProviderId,
    setProvider,
    getProvider,
    getEmbedUrl,
    getAllProviders,
  }
}
