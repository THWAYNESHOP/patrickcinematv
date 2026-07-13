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
  useProxy?: boolean
}

export const STREAMING_PROVIDERS: Record<string, StreamingProvider> = {
  vixsrc: {
    id: 'vixsrc',
    name: 'vixsrc',
    displayName: 'VixSrc',
    movieUrlTemplate: 'https://vixsrc.to/movie/{tmdbId}',
    tvUrlTemplate: 'https://vixsrc.to/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: true,
    supportsNextEpisode: true,
    supportsEpisodeSelector: true,
    supportedParams: ['autoplay', 'startAt', 'lang', 'primaryColor', 'secondaryColor'],
    origin: 'https://vixsrc.to',
  },
  vidking: {
    id: 'vidking',
    name: 'vidking',
    displayName: 'VidKing',
    movieUrlTemplate: 'https://www.vidking.net/embed/movie/{tmdbId}',
    tvUrlTemplate: 'https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: true,
    supportsNextEpisode: true,
    supportsEpisodeSelector: true,
    supportedParams: ['autoplay', 'quality'],
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
    supportedParams: ['primaryColor', 'secondaryColor', 'iconColor', 'icons', 'player', 'title', 'poster', 'autoplay', 'nextbutton', 'startAt', 'quality'],
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
    supportedParams: ['autoplay', 'quality'],
    origin: 'https://vidfast.pro',
  },
  anyembed: {
    id: 'anyembed',
    name: 'anyembed',
    displayName: 'Anyembed',
    movieUrlTemplate: 'https://player.autoembed.app/embed/movie/{tmdbId}',
    tvUrlTemplate: 'https://player.autoembed.app/embed/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: false,
    supportsNextEpisode: false,
    supportsEpisodeSelector: false,
    supportedParams: ['server'],
    origin: 'https://player.autoembed.app',
    useProxy: true,
  },
  vidapi: {
    id: 'vidapi',
    name: 'vidapi',
    displayName: 'VidAPI',
    movieUrlTemplate: 'https://vaplayer.ru/embed/movie/{tmdbId}',
    tvUrlTemplate: 'https://vaplayer.ru/embed/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: true,
    supportsNextEpisode: true,
    supportsEpisodeSelector: true,
    supportedParams: ['primaryColor', 'title', 'poster', 'autoplay', 'startAt', 'resumeAt', 'sub_url', 'sub_file', 'sub_label', 'sub_lang', 'sub_default', 'lang', 'controls', 'overlay', 'thumbnails'],
    origin: 'https://vaplayer.ru',
    useProxy: false,
  },
  vidspark: {
    id: 'vidspark',
    name: 'vidspark',
    displayName: 'VidSpark',
    movieUrlTemplate: 'https://moviesapi.to/movie/{tmdbId}',
    tvUrlTemplate: 'https://moviesapi.to/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: true,
    supportsNextEpisode: true,
    supportsEpisodeSelector: true,
    supportedParams: ['autoplay', 'primaryColor', 'title', 'poster', 'startAt', 'resumeAt'],
    origin: 'https://moviesapi.to',
    useProxy: false,
  },
  apiplayer: {
    id: 'apiplayer',
    name: 'apiplayer',
    displayName: 'APIPlayer',
    movieUrlTemplate: 'https://apiplayer.ru/embed/movie/{tmdbId}',
    tvUrlTemplate: 'https://apiplayer.ru/embed/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: true,
    supportsNextEpisode: true,
    supportsEpisodeSelector: true,
    supportedParams: ['autoplay', 'sub_url', 'primaryColor', 'title', 'poster', 'startAt', 'resumeAt', 'controls', 'overlay'],
    origin: 'https://apiplayer.ru',
    useProxy: false,
  },
  vidphantom: {
    id: 'vidphantom',
    name: 'vidphantom',
    displayName: 'VidPhantom',
    movieUrlTemplate: 'https://vidphantom.com/movie/{tmdbId}',
    tvUrlTemplate: 'https://vidphantom.com/tv/{tmdbId}/{season}/{episode}',
    supportsAutoplay: true,
    supportsNextEpisode: true,
    supportsEpisodeSelector: true,
    supportedParams: ['primaryColor','secondaryColor','iconColor','accentColor','backdropColor','icons','poster','autoplay','nextbutton','startAt','sub_file','sub_label','sub_lang','subColor','subBgColor','subBgOpacity','subSize','subBottom','subShadow'],
    origin: 'https://vidphantom.com',
    useProxy: false,
  },
}

export const DEFAULT_PROVIDER = 'vixsrc'
export const PROVIDER_ORDER = ['vixsrc', 'vidking', 'vidlink', 'vidfast', 'anyembed', 'vidapi', 'vidspark', 'apiplayer', 'vidphantom']

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

  // If provider requests proxying, wrap the provider URL with configured proxy endpoint.
  if (provider.useProxy) {
    const env = (import.meta as any)?.env
    const proxyBase = (env && env.VITE_STREAM_PROXY_URL) || '/api/stream'
    return `${proxyBase}?url=${encodeURIComponent(url)}`
  }

  return url
}

export function getProviderById(id: string): StreamingProvider | undefined {
  return STREAMING_PROVIDERS[id]
}

export function getAllProviders(): StreamingProvider[] {
  return PROVIDER_ORDER.map(id => STREAMING_PROVIDERS[id]).filter(Boolean) as StreamingProvider[]
}
