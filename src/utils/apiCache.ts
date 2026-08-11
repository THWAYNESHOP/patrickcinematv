import { tmdbApi } from '../api/tmdb'

// Enhanced API cache with stale-while-revalidate pattern
interface CacheEntry<T> {
  data: T
  timestamp: number
  staleAt: number
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const STALE_DURATION = 2 * 60 * 1000 // 2 minutes - time when data becomes stale
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes - time when data expires
const STORAGE_KEY = 'nexastream:api-cache'

// Background refresh queue to prevent duplicate refreshes
const refreshQueue = new Set<string>()

function readPersistedCache() {
  if (typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw) as Record<string, { data: unknown; timestamp: number; staleAt: number; expiresAt: number }>
    const now = Date.now()
    
    Object.entries(parsed).forEach(([key, value]) => {
      const isExpired = now > value.expiresAt
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

  const now = Date.now()
  
  // Check if data is expired
  if (now > cached.expiresAt) {
    cache.delete(key)
    persistCache()
    return null
  }

  // Return data even if stale (stale-while-revalidate)
  return cached.data as T
}

export function isStale(key: string): boolean {
  const cached = cache.get(key)
  if (!cached) return true
  
  return Date.now() > cached.staleAt
}

export function setCached<T>(key: string, data: T): void {
  const now = Date.now()
  cache.set(key, {
    data,
    timestamp: now,
    staleAt: now + STALE_DURATION,
    expiresAt: now + CACHE_DURATION,
  })
  persistCache()
}

export function clearCache(): void {
  cache.clear()
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

// Stale-while-revalidate: return cached data and refresh in background
export async function getWithRefresh<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<{ data: T; isStale: boolean }> {
  const cached = getCached<T>(key)
  const isDataStale = isStale(key)
  
  // If data is fresh, return immediately
  if (cached && !isDataStale) {
    return { data: cached, isStale: false }
  }
  
  // If data is stale or missing, return cached data (if available) and refresh in background
  if (cached) {
    // Refresh in background if not already refreshing
    if (!refreshQueue.has(key)) {
      refreshQueue.add(key)
      fetcher()
        .then((freshData) => {
          setCached(key, freshData)
        })
        .catch(() => {
          // Silent fail - keep using stale data
        })
        .finally(() => {
          refreshQueue.delete(key)
        })
    }
    
    return { data: cached, isStale: true }
  }
  
  // No cached data, fetch fresh
  const freshData = await fetcher()
  setCached(key, freshData)
  return { data: freshData, isStale: false }
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

// Cache statistics for monitoring
export function getCacheStats() {
  const entries = Array.from(cache.entries())
  const now = Date.now()
  
  return {
    totalEntries: entries.length,
    freshEntries: entries.filter(([_, entry]) => now < entry.staleAt).length,
    staleEntries: entries.filter(([_, entry]) => now >= entry.staleAt && now < entry.expiresAt).length,
    expiredEntries: entries.filter(([_, entry]) => now >= entry.expiresAt).length,
    totalSize: JSON.stringify(Object.fromEntries(entries)).length,
  }
}

// Preload specific API endpoints
export async function preloadEndpoint(key: string, fetcher: () => Promise<unknown>) {
  if (cache.has(key)) return
  
  try {
    const data = await fetcher()
    setCached(key, data)
  } catch {
    // Silent fail for preload
  }
}
