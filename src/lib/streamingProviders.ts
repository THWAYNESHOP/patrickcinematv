export interface StreamingProvider {
  id: string
  name: string
  displayName: string
  movieUrlTemplate: string
  tvUrlTemplate: string
  supportsAutoplay: boolean
  supportsNextEpisode: boolean
  supportsEpisodeSelector: boolean
  supportedParams?: string[]
  origin?: string // For postMessage security
}

export const STREAMING_PROVIDERS: Record<string, StreamingProvider> = {
  vidking: {
    id: 'vidking',
    name: 'vidking',
    displayName: 'VidKing',
    movieUrlTemplate: 'https://www.vidking.net/embed/movie/{tmdbId}',
    tvUrlTemplate: 'https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: true,
    supportsNextEpisode: true,
    supportsEpisodeSelector: true,
    origin: 'https://www.vidking.net',
  },
  vidlink: {
    id: 'vidlink',
    name: 'vidlink',
    displayName: 'VidLink',
    movieUrlTemplate: 'https://vidlink.pro/movie/{tmdbId}',
    tvUrlTemplate: 'https://vidlink.pro/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: true,
    supportsNextEpisode: true,
    supportsEpisodeSelector: true,
    supportedParams: ['primaryColor', 'secondaryColor', 'iconColor', 'icons', 'player', 'title', 'poster', 'autoplay', 'nextbutton', 'startAt'],
    origin: 'https://vidlink.pro',
  },
  vidfast: {
    id: 'vidfast',
    name: 'vidfast',
    displayName: 'VidFast',
    movieUrlTemplate: 'https://vidfast.pro/movie/{tmdbId}',
    tvUrlTemplate: 'https://vidfast.pro/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: true,
    supportsNextEpisode: true,
    supportsEpisodeSelector: true,
    origin: 'https://vidfast.pro',
  },
}

export const DEFAULT_PROVIDER = 'vidlink'
export const PROVIDER_ORDER = ['vidking', 'vidlink', 'vidfast']

export function getProviderUrl(
  providerId: string,
  type: 'movie' | 'tv',
  tmdbId: string | number,
  season?: number,
  episode?: number,
  params?: Record<string, string | number | boolean>
): string {
  const provider = STREAMING_PROVIDERS[providerId]
  if (!provider) {
    throw new Error(`Provider ${providerId} not found`)
  }

  const template = type === 'movie' ? provider.movieUrlTemplate : provider.tvUrlTemplate
  let url = template
    .replace('{tmdbId}', String(tmdbId))
    .replace('{season}', String(season || 1))
    .replace('{episode}', String(episode || 1))

  // Add query parameters if provider supports them
  if (params && provider.supportedParams) {
    const validParams = provider.supportedParams.filter(param => params[param] !== undefined)
    if (validParams.length > 0) {
      const searchParams = new URLSearchParams()
      validParams.forEach(param => {
        searchParams.append(param, String(params[param]))
      })
      url += `?${searchParams.toString()}`
    }
  }

  return url
}

export function getProviderById(id: string): StreamingProvider | undefined {
  return STREAMING_PROVIDERS[id]
}

export function getAllProviders(): StreamingProvider[] {
  return PROVIDER_ORDER.map(id => STREAMING_PROVIDERS[id]).filter(Boolean) as StreamingProvider[]
}
