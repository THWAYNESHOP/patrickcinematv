import { tmdbApi } from '../api/tmdb'

// Simple API cache to reduce redundant requests and keep content available offline
const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const STORAGE_KEY = 'nexastream:api-cache'

function readPersistedCache() {
  if (typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw) as Record<string, { data: unknown; timestamp: number }>
    Object.entries(parsed).forEach(([key, value]) => {
      const isExpired = Date.now() - value.timestamp > CACHE_DURATION
      if (!isExpired) {
        cache.set(key, value)
      }
    })
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

function persistCache() {
  if (typeof window === 'undefined') return

  try {
    const serializable = Object.fromEntries(cache.entries())
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch {
    // Ignore storage write failures in private or full browsers
  }
}

readPersistedCache()

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null

  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
  if (isExpired) {
    cache.delete(key)
    persistCache()
    return null
  }

  return cached.data as T
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
  persistCache()
}

export function clearCache(): void {
  cache.clear()
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

// Prefetch trending data in the background
export async function prefetchTrendingData() {
  try {
    // Prefetch trending movies and TV
    await Promise.all([
      tmdbApi.getTrendingMoviesToday().catch(() => {}),
      tmdbApi.getTrendingTVToday().catch(() => {}),
    ])
  } catch {
    // Silent fail for prefetch
  }
}
