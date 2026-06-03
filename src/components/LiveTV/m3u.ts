import type { ChannelCategory } from '../../data/liveTvChannels'

export interface ParsedM3UEntry {
  name: string
  streamUrl: string
  group?: string
  logo?: string
  isHD: boolean
  category: ChannelCategory
}

const CATEGORY_KEYWORDS: Array<{ category: ChannelCategory; keywords: string[] }> = [
  { category: 'Czech Sports', keywords: ['sport 1', 'sport 2', 'czech', '[cz]'] },
  { category: 'Setanta Sports', keywords: ['setanta', 'upl tv'] },
  { category: 'Go3 Sports', keywords: ['go3'] },
  { category: 'Balkan Sports', keywords: ['max sport', 'diemasport', 'nova sport'] },
  { category: 'Digi Sports', keywords: ['digi sport', 'digi 4k'] },
  { category: 'UK Sports', keywords: ['tnt sports', 'sky sport', 'sky sports'] },
  { category: 'International Sports', keywords: ['espn', 'fox sport', 'nba tv', 'nhl network', 'eurosport', 'cbc sport', 'best4sport'] },
]

export function parseM3UPlaylist(text: string): ParsedM3UEntry[] {
  const entries: ParsedM3UEntry[] = []
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())

  let pendingName = ''
  let pendingGroup = ''
  let pendingLogo = ''

  for (const line of lines) {
    if (!line) continue

    if (line.startsWith('#EXTINF:')) {
      const commaIndex = line.indexOf(',')
      const metaPart = commaIndex >= 0 ? line.slice(0, commaIndex) : line
      pendingName = commaIndex >= 0 ? line.slice(commaIndex + 1).trim() : ''
      pendingGroup = extractAttribute(metaPart, 'group-title')
      pendingLogo = extractAttribute(metaPart, 'tvg-logo')
      continue
    }

    if (line.startsWith('#')) continue

    if (isLikelyUrl(line)) {
      const name = pendingName || guessNameFromUrl(line)
      const category = inferCategory(name, pendingGroup)

      entries.push({
        name,
        streamUrl: line,
        group: pendingGroup || undefined,
        logo: pendingLogo || undefined,
        isHD: inferIsHD(name, line),
        category,
      })

      pendingName = ''
      pendingGroup = ''
      pendingLogo = ''
    }
  }

  return entries
}

export function inferCategory(name: string, group?: string): ChannelCategory {
  const haystack = `${group ?? ''} ${name}`.toLowerCase()

  for (const bucket of CATEGORY_KEYWORDS) {
    if (bucket.keywords.some((keyword) => haystack.includes(keyword))) {
      return bucket.category
    }
  }

  return 'Other Sports'
}

export function inferIsHD(name: string, streamUrl?: string): boolean {
  const haystack = `${name} ${streamUrl ?? ''}`.toLowerCase()
  return /\b(hd|4k)\b/.test(haystack)
}

export function inferPlaybackMode(streamUrl: string): 'iframe' | 'video' {
  const lower = streamUrl.toLowerCase()

  if (lower.includes('|user-agent=') || lower.includes('embed') || lower.includes('player')) {
    return 'iframe'
  }

  if (lower.includes('.m3u8') || lower.includes('.mp4') || lower.includes('.webm')) {
    return 'video'
  }

  return 'iframe'
}

export function upgradeHttpIfNeeded(streamUrl: string): string {
  // Remove pipe and everything after it (User-Agent parameter)
  let cleanUrl = streamUrl.split('|')[0]
  
  // Remove trailing ? if present
  cleanUrl = cleanUrl.replace(/\?$/, '')
  
  // Don't upgrade to https - keep original protocol
  return cleanUrl
}

function extractAttribute(source: string, attribute: string): string {
  const match = source.match(new RegExp(`${attribute}="([^"]*)"`, 'i'))
  return match?.[1] ?? ''
}

function isLikelyUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || /^\/\//.test(value)
}

function guessNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const lastSegment = parsed.pathname.split('/').filter(Boolean).pop()
    if (lastSegment) {
      return decodeURIComponent(lastSegment)
    }
  } catch {
    // fall through
  }

  return 'Live Channel'
}
