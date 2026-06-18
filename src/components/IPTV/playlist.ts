export interface IptvChannel {
  id: string
  name: string
  streamUrl: string
  playbackUrl: string
  category: string
  group?: string
  logo?: string
  isHD: boolean
  is4K: boolean
  hasUnsupportedHeaders: boolean
  isOnline?: boolean
}

type PendingEntry = {
  name: string
  group?: string
  logo?: string
}

const QUALITY_KEYWORDS = /\b(4k|uhd|hd)\b/i

export function parseIptvPlaylist(text: string): IptvChannel[] {
  const playlist = repairMojibake(text)
  const lines = playlist.replace(/^\uFEFF/, '').split(/\r?\n/)
  const channels: IptvChannel[] = []
  let pendingEntry: PendingEntry | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('#EXTGRP:')) {
      if (!pendingEntry) pendingEntry = { name: '', group: '', logo: '' }
      pendingEntry.group = repairMojibake(line.slice(8).trim())
      continue
    }

    if (line.startsWith('#EXTINF:')) {
      pendingEntry = parseExtInf(line)
      continue
    }

    if (line.startsWith('#')) continue

    if (!isUrl(line)) continue

    const playbackUrl = cleanStreamUrl(line)
    const entry = pendingEntry ?? { name: guessNameFromUrl(playbackUrl) }
    const channelName = repairMojibake(entry.name || guessNameFromUrl(playbackUrl))
    const group = repairMojibake(entry.group || '').trim()
    const category = group || 'Uncategorized'
    const hasUnsupportedHeaders = hasUnsupportedHeaderHints(line)
    const is4K = /\b(4k|uhd)\b/i.test(`${channelName} ${group} ${line}`)

    channels.push({
      id: createChannelId(channelName, category, channels.length),
      name: channelName,
      streamUrl: line,
      playbackUrl,
      category,
      group: group || undefined,
      logo: entry.logo ? repairMojibake(entry.logo) : undefined,
      isHD: QUALITY_KEYWORDS.test(`${channelName} ${group} ${line}`),
      is4K,
      hasUnsupportedHeaders,
      isOnline: true,
    })

    pendingEntry = null
  }

  return channels
}

export function cleanStreamUrl(streamUrl: string): string {
  return streamUrl.split('|')[0].replace(/\?$/, '')
}

export function hasUnsupportedHeaderHints(streamUrl: string): boolean {
  return /[?&](?:user-agent|referer|cookie|origin)=/i.test(streamUrl)
}

export function getPlaybackKind(channel: IptvChannel): 'iframe' | 'video' | 'hls' | 'unsupported' {
  const lower = channel.playbackUrl.toLowerCase()
  
  if (channel.hasUnsupportedHeaders || lower.includes('embed') || lower.includes('player')) return 'iframe'
  if (lower.match(/\.(mp4|webm)(?:\?|$)/)) return 'video'
  return 'hls'
}

export async function checkStreamStatus(url: string): Promise<boolean> {
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors' })
    return true
  } catch {
    return false
  }
}

function parseExtInf(line: string): PendingEntry {
  const commaIndex = line.indexOf(',')
  const meta = commaIndex >= 0 ? line.slice(0, commaIndex) : line
  const name = commaIndex >= 0 ? repairMojibake(line.slice(commaIndex + 1).trim()) : ''
  return {
    name: name || '',
    group: extractAttribute(meta, 'group-title') || undefined,
    logo: extractAttribute(meta, 'tvg-logo') || undefined,
  }
}

function extractAttribute(source: string, attribute: string): string {
  const match = source.match(new RegExp(`${attribute}="([^"]*)"`, 'i'))
  return match?.[1] ?? ''
}

function createChannelId(name: string, category: string, index: number): string {
  return `${index}-${slugify(category)}-${slugify(name)}`
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || /^\/\//.test(value)
}

function guessNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const lastSegment = parsed.pathname.split('/').filter(Boolean).pop()
    if (lastSegment) {
      return repairMojibake(decodeURIComponent(lastSegment))
    }
  } catch {
    // Ignore invalid URLs
  }

  return 'Live Channel'
}

function repairMojibake(value: string): string {
  if (!/[ÐÑÃÂÄÅÆØ]/.test(value)) {
    return value
  }

  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0) & 0xff)
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return value
  }
}
