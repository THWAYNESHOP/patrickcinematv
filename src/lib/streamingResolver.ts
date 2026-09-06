import { VidsrcTo } from './extractors/VidsrcTo'
import { Vidplay } from './extractors/Vidplay'
import { VidsrcMe } from './extractors/VidsrcMe'
import { VidLink } from './extractors/VidLink'
import { EmbedSt } from './extractors/EmbedSt'
import { Moviesapi } from './extractors/Moviesapi'
import { VidsrcNet } from './extractors/VidsrcNet'
import { VixSrc } from './extractors/VixSrc'
import { TwoEmbed } from './extractors/TwoEmbed'
import { Videasy } from './extractors/Videasy'
import { Vidflix } from './extractors/Vidflix'
import { PrimeSrc } from './extractors/PrimeSrc'
import { Rabbitstream, Megacloud } from './extractors/Rabbitstream'
import { Vidrock } from './extractors/Vidrock'
import { Vidzee } from './extractors/Vidzee'
import { VidsrcRu } from './extractors/VidsrcRu'

export type StreamKind = 'movie' | 'tv' | 'live' | 'sports'

export type StreamExtractorResult = {
  streamUrl: string
  streamType: 'hls' | 'mp4' | 'dash'
  subtitles?: Array<{ label: string; url: string }>
  headers?: Record<string, string>
}

type ExtractorImplementation = {
  extract: (tmdbId: string, kind: 'movie' | 'tv', season: number, episode: number) => Promise<StreamExtractorResult>
}

const extractors: Record<string, ExtractorImplementation> = {
  vidsrcTo: new VidsrcTo(),
  vidsrcMe: new VidsrcMe(),
  vidplay: new Vidplay(),
  vidlink: new VidLink(),
  embedSt: new EmbedSt(),
  moviesapi: new Moviesapi(),
  vidsrcNet: new VidsrcNet(),
  vixSrc: new VixSrc(),
  twoEmbed: new TwoEmbed(),
  videasy: new Videasy(),
  vidflix: new Vidflix(),
  primeSrc: new PrimeSrc(),
  rabbitstream: new Rabbitstream(),
  megacloud: new Megacloud(),
  vidrock: new Vidrock(),
  vidzee: new Vidzee(),
  vidsrcRu: new VidsrcRu()
}

export interface StreamRequest {
  kind: StreamKind
  id: string
  title?: string
  providers?: string[]
  fallbackProviders?: string[]
  excludedProviders?: string[]
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
  headers?: Record<string, string>
}

type NativeProviderDefinition = {
  name: string
  aliases: string[]
  extractor: keyof typeof extractors
  supportedKinds?: Array<'movie' | 'tv'>
  autoFallback?: boolean
}

const NATIVE_PROVIDER_DEFINITIONS: NativeProviderDefinition[] = [
  { name: 'VixSrc', aliases: ['vixsrc', 'vix-src'], extractor: 'vixSrc' },
  { name: 'Videasy', aliases: ['videasy'], extractor: 'videasy' },
  { name: '2Embed', aliases: ['twoembed', '2embed'], extractor: 'twoEmbed' },
  { name: 'Moviesapi', aliases: ['moviesapi', 'moviesapi.club', 'vidspark'], extractor: 'moviesapi', supportedKinds: ['movie'] },
  { name: 'Vidsrc.net', aliases: ['vidsrcnet', 'vidsrc-embed', 'vidsrc-embed.ru'], extractor: 'vidsrcNet' },
  { name: 'VidLink', aliases: ['vidlink', 'vidlink.pro'], extractor: 'vidlink' },
  { name: 'Vidsrc.Ru', aliases: ['vidsrcru', 'vidsrc.ru'], extractor: 'vidsrcRu' },
  { name: 'Vidflix', aliases: ['vidflix', 'vidflix.club'], extractor: 'vidflix' },
  { name: 'Vidrock', aliases: ['vidrock', 'vidrock.net'], extractor: 'vidrock' },
  { name: 'Vidzee', aliases: ['vidzee', 'player.vidzee.wtf'], extractor: 'vidzee' },
  { name: 'PrimeSrc', aliases: ['primesrc', 'primesrc.me'], extractor: 'primeSrc' },
  { name: 'Megacloud', aliases: ['megacloud'], extractor: 'megacloud' },
  { name: 'Rabbitstream', aliases: ['rabbitstream'], extractor: 'rabbitstream' },
  { name: 'EmbedSt', aliases: ['embedst', 'embed.st'], extractor: 'embedSt', autoFallback: false },
  { name: 'Vidsrc.to', aliases: ['vidsrcto', 'vidsrc.to'], extractor: 'vidsrcTo', autoFallback: false },
  { name: 'Vidsrc.me', aliases: ['vidsrcme', 'vidsrc.me'], extractor: 'vidsrcMe', autoFallback: false },
]

function isAutoFallbackProvider(provider: NativeProviderDefinition) {
  return provider.autoFallback !== false
}

export const NATIVE_FALLBACK_PROVIDER_ORDER = NATIVE_PROVIDER_DEFINITIONS
  .filter(isAutoFallbackProvider)
  .map((provider) => provider.name)

const inFlightStreamResolutions = new Map<string, Promise<StreamSource>>()

export class StreamSourceUnavailableError extends Error {
  constructor(request: StreamRequest) {
    super(`No playable stream source was found for ${request.kind} ${request.id}.`)
    this.name = 'StreamSourceUnavailableError'
  }
}

function normalizeTitle(kind: StreamKind, fallbackTitle = 'Stream') {
  if (kind === 'live') return `${fallbackTitle} Live`
  if (kind === 'sports') return `${fallbackTitle} Sports`
  if (kind === 'tv') return `${fallbackTitle} Episode`
  return `${fallbackTitle} Movie`
}

function hasRequestedDemoSource(request: StreamRequest) {
  const requestedProviders = [
    ...(request.providers || []),
    ...(request.fallbackProviders || []),
  ].map((provider) => provider.toLowerCase())

  return requestedProviders.includes('demo-hls')
}

function createDemoSource(request: StreamRequest): StreamSource {
  return {
    id: request.id,
    title: request.title || normalizeTitle(request.kind),
    type: request.kind,
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    streamType: 'hls',
    provider: 'Demo HLS',
  }
}

async function withTimeout<T>(promise: Promise<T>, providerName: string, timeoutMs = 8000): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${providerName} timed out`)), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeout])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

function shouldLogStreamResolution() {
  if (typeof window === 'undefined') return false

  try {
    return window.localStorage.getItem('nexastream:debug-streams') === '1'
  } catch {
    return false
  }
}

function debugStreamResolution(message: string, error?: unknown) {
  if (!shouldLogStreamResolution()) return

  if (error) {
    console.debug(message, error)
    return
  }

  console.debug(message)
}

function normalizeProviderKey(provider: string) {
  return provider.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function getProviderKeys(provider: NativeProviderDefinition) {
  return [provider.name, ...provider.aliases].map(normalizeProviderKey)
}

function supportsStreamKind(provider: NativeProviderDefinition, kind: StreamKind) {
  if (kind !== 'movie' && kind !== 'tv') return false
  return !provider.supportedKinds || provider.supportedKinds.includes(kind as 'movie' | 'tv')
}

function isProviderExcluded(provider: NativeProviderDefinition, excluded: Set<string>) {
  return getProviderKeys(provider).some((key) => excluded.has(key))
}

function orderNativeProviderDefinitions(request: Pick<StreamRequest, 'kind'> & Partial<Pick<StreamRequest, 'providers' | 'fallbackProviders' | 'excludedProviders'>>) {
  const { kind, providers = [], fallbackProviders = [], excludedProviders = [] } = request
  const excluded = new Set(excludedProviders.map(normalizeProviderKey))
  const availableProviders = NATIVE_PROVIDER_DEFINITIONS
    .filter((provider) => supportsStreamKind(provider, kind))
    .filter((provider) => !isProviderExcluded(provider, excluded))
  const autoFallbackProviders = availableProviders.filter(isAutoFallbackProvider)

  const providersByKey = new Map<string, NativeProviderDefinition>()
  for (const provider of availableProviders) {
    for (const key of getProviderKeys(provider)) {
      providersByKey.set(key, provider)
    }
  }

  const requestedKeys = [...providers, ...fallbackProviders]
    .map(normalizeProviderKey)
    .filter((provider) => !excluded.has(provider))
  const requestedProviders = requestedKeys
    .map((provider) => providersByKey.get(provider))
    .filter((provider): provider is NativeProviderDefinition => Boolean(provider))

  if (!requestedProviders.length) {
    return autoFallbackProviders
  }

  const seen = new Set<string>()
  return [...requestedProviders, ...autoFallbackProviders].filter((provider) => {
    const key = normalizeProviderKey(provider.name)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getRequestCacheKey(request: StreamRequest) {
  return JSON.stringify({
    kind: request.kind,
    id: request.id,
    providers: (request.providers || []).map(normalizeProviderKey),
    fallbackProviders: (request.fallbackProviders || []).map(normalizeProviderKey),
    excludedProviders: (request.excludedProviders || []).map(normalizeProviderKey),
  })
}

export function getNativeProviderOrderForRequest(request: Pick<StreamRequest, 'kind'> & Partial<Pick<StreamRequest, 'providers' | 'fallbackProviders' | 'excludedProviders'>>) {
  return orderNativeProviderDefinitions(request).map((provider) => provider.name)
}

export async function resolveStreamSource(request: StreamRequest): Promise<StreamSource> {
  const cacheKey = getRequestCacheKey(request)
  const inFlight = inFlightStreamResolutions.get(cacheKey)

  if (inFlight) {
    return inFlight
  }

  const resolution = resolveStreamSourceUncached(request)
  inFlightStreamResolutions.set(cacheKey, resolution)

  try {
    return await resolution
  } finally {
    if (inFlightStreamResolutions.get(cacheKey) === resolution) {
      inFlightStreamResolutions.delete(cacheKey)
    }
  }
}

async function resolveStreamSourceUncached(request: StreamRequest): Promise<StreamSource> {
  const { kind, id, excludedProviders = [], providers = [], fallbackProviders = [] } = request

  if (hasRequestedDemoSource(request)) {
    return createDemoSource(request)
  }

  if (kind === 'movie' || kind === 'tv') {
    const parts = id.split('-')
    const tmdbId = parts[0]
    const season = parts[1] ? Number(parts[1]) : 1
    const episode = parts[2] ? Number(parts[2]) : 1

    const orderedProviders = orderNativeProviderDefinitions({ kind, providers, fallbackProviders, excludedProviders })

    const providerBatchSize = 3
    for (let index = 0; index < orderedProviders.length; index += providerBatchSize) {
      const providerBatch = orderedProviders.slice(index, index + providerBatchSize)
      const attempts = providerBatch.map(async (provider) => {
        debugStreamResolution(`Attempting extraction via ${provider.name}...`)

        const result = await withTimeout(
          extractors[provider.extractor].extract(tmdbId, kind, season, episode),
          provider.name,
        )

        const candidate = result as Partial<StreamExtractorResult>
        if (
          !candidate ||
          typeof candidate !== 'object' ||
          typeof candidate.streamUrl !== 'string' ||
          !candidate.streamType
        ) {
          throw new Error(`${provider.name} returned an invalid stream payload`)
        }

        return {
          id: request.id,
          title: request.title || normalizeTitle(request.kind),
          type: request.kind,
          streamUrl: candidate.streamUrl,
          streamType: candidate.streamType,
          provider: provider.name,
          subtitles: candidate.subtitles,
          headers: candidate.headers,
        }
      })

      try {
        return await Promise.any(attempts)
      } catch (error) {
        debugStreamResolution(`${providerBatch.map((provider) => provider.name).join(', ')} extraction failed:`, error)
      }
    }
  }

  throw new StreamSourceUnavailableError(request)
}
