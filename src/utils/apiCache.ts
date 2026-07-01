// Simple API cache to reduce redundant requests
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached) return null
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION
  if (isExpired) {
    cache.delete(key)
    return null
  }
  
  return cached.data as T
}

export function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function clearCache(): void {
  cache.clear()
}

import { tmdbApi } from '../api/tmdb'

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
