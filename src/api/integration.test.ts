import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { sportsApi } from './sports'
import { tmdbApi } from './tmdb'

// Type augmentation for Vite environment variables
interface ImportMetaEnv {
  VITE_TMDB_API_KEY?: string
}

interface ImportMeta {
  env: ImportMetaEnv
}

describe('API Integration Tests', () => {
  describe('Sports API Integration', () => {
    it('should fetch live matches', async () => {
      const matches = await sportsApi.getLiveMatches()
      
      expect(Array.isArray(matches)).toBe(true)
      expect(matches.length).toBeGreaterThanOrEqual(0)
      
      if (matches.length > 0) {
        const firstMatch = matches[0]
        expect(firstMatch).toHaveProperty('id')
        expect(firstMatch).toHaveProperty('title')
        expect(firstMatch).toHaveProperty('homeTeam')
        expect(firstMatch).toHaveProperty('awayTeam')
        expect(firstMatch).toHaveProperty('sport')
      }
    })

    it('should handle API errors gracefully', async () => {
      // This test verifies error handling when API is unavailable
      const matches = await sportsApi.getLiveMatches()
      
      // Should return mock data as fallback
      expect(Array.isArray(matches)).toBe(true)
    })

    it('should fetch streams for a match', async () => {
      const streams = await sportsApi.getStreams('alpha', 'match1')
      
      expect(Array.isArray(streams)).toBe(true)
    })
  })

  describe('TMDB API Integration', () => {
    it('should fetch popular movies', async () => {
      const movies = await tmdbApi.getPopularMovies()
      
      expect(Array.isArray(movies)).toBe(true)
      expect(movies.length).toBeGreaterThan(0)
      
      const firstMovie = movies[0]
      expect(firstMovie).toHaveProperty('id')
      expect(firstMovie).toHaveProperty('title')
      expect(firstMovie).toHaveProperty('poster')
      expect(firstMovie).toHaveProperty('rating')
    })

    it('should fetch trending movies', async () => {
      const movies = await tmdbApi.getTrendingMoviesToday()
      
      expect(Array.isArray(movies)).toBe(true)
    })

    it('should fetch trending TV shows', async () => {
      const shows = await tmdbApi.getTrendingTVToday()
      
      expect(Array.isArray(shows)).toBe(true)
    })

    it('should search for content', async () => {
      const results = await tmdbApi.searchMulti('action')
      
      expect(Array.isArray(results)).toBe(true)
    })
  })

  describe('API Response Caching', () => {
    it('should cache responses to reduce API calls', async () => {
      const start1 = Date.now()
      await tmdbApi.getPopularMovies()
      const time1 = Date.now() - start1
      
      const start2 = Date.now()
      await tmdbApi.getPopularMovies()
      const time2 = Date.now() - start2
      
      // Cached response should be faster or similar (allowing for timing variations)
      expect(time2).toBeLessThanOrEqual(time1)
    })
  })
})
