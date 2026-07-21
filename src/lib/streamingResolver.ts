export type StreamKind = 'movie' | 'tv' | 'live' | 'sports'

export interface StreamRequest {
  kind: StreamKind
  id: string
  title?: string
  providers?: string[]
  fallbackProviders?: string[]
}

export interface StreamSource {
  id: string
  title: string
  type: StreamKind
  streamUrl: string
  streamType: 'hls' | 'mp4' | 'dash'
  poster?: string
  subtitles?: Array<{ label: string; url: string }> 
  provider?: string
}

interface ProviderResult {
  streamUrl: string
  streamType: StreamSource['streamType']
  title?: string
  poster?: string
}

const demoProviderMap: Record<string, ProviderResult> = {
  'demo-hls': {
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    streamType: 'hls',
    title: 'Demo HLS Stream',
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80',
  },
  'demo-broken': {
    streamUrl: '',
    streamType: 'hls',
    title: 'Broken Demo',
  },
}

function normalizeTitle(kind: StreamKind, fallbackTitle = 'Stream') {
  if (kind === 'live') return `${fallbackTitle} Live`
  if (kind === 'sports') return `${fallbackTitle} Sports`
  if (kind === 'tv') return `${fallbackTitle} Episode`
  return `${fallbackTitle} Movie`
}

export async function resolveStreamSource(request: StreamRequest): Promise<StreamSource> {
  const providerOrder = [...(request.providers || []), ...(request.fallbackProviders || [])]

  for (const providerId of providerOrder) {
    const providerResult = demoProviderMap[providerId]

    if (!providerResult || !providerResult.streamUrl) {
      continue
    }

    return {
      id: request.id,
      title: request.title || providerResult.title || normalizeTitle(request.kind),
      type: request.kind,
      streamUrl: providerResult.streamUrl,
      streamType: providerResult.streamType,
      poster: providerResult.poster,
      provider: providerId,
      subtitles: [
        {
          label: 'English',
          url: 'https://example.com/subtitles/en.vtt',
        },
      ],
    }
  }

  return {
    id: request.id,
    title: request.title || normalizeTitle(request.kind),
    type: request.kind,
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    streamType: 'hls',
    provider: 'demo-hls',
  }
}
