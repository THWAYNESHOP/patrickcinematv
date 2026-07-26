import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios')

const TEST_TMDB_API_KEY = 'test-tmdb-key'

let tmdbApi: Awaited<ReturnType<typeof import('./tmdb')>>['tmdbApi']

const mockAxios = vi.mocked(axios)

describe('TMDB API', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.stubEnv('VITE_TMDB_API_KEY', TEST_TMDB_API_KEY)

    const tmdbModule = await import('./tmdb')
    tmdbApi = tmdbModule.tmdbApi
  })

  describe('getPopularMovies', () => {
    it('should return popular movies', async () => {
      const mockMovies = [
        { id: 1, title: 'Movie 1', poster_path: '/path1.jpg', vote_average: 8.5, release_date: '2023-01-01' },
        { id: 2, title: 'Movie 2', poster_path: '/path2.jpg', vote_average: 7.5, release_date: '2023-02-01' }
      ]
      
      mockAxios.get.mockResolvedValue({ data: { results: mockMovies } })
      
      const result = await tmdbApi.getPopularMovies()
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('movie/popular'),
        expect.any(Object)
      )
    })

    it('uses the proxy endpoint in production without requiring a client-side key', async () => {
      vi.resetModules()
      vi.stubEnv('MODE', 'production')
      vi.stubEnv('VITE_TMDB_API_KEY', '')

      const { tmdbApi: productionTmdbApi } = await import('./tmdb')
      mockAxios.get.mockResolvedValue({ data: { results: [] } })

      await productionTmdbApi.getPopularMovies()

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/tmdb/movie/popular',
        expect.objectContaining({
          params: expect.objectContaining({
            language: 'en-US',
            page: 1,
          }),
        })
      )
      expect(mockAxios.get).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({ api_key: '' }),
        })
      )
    })
  })

  describe('getMovieDetails', () => {
    it('should return movie details', async () => {
      const mockMovie = {
        id: 1,
        title: 'Test Movie',
        poster_path: '/path.jpg',
        backdrop_path: '/backdrop.jpg',
        vote_average: 8.5,
        release_date: '2023-01-01',
        overview: 'Test overview',
        runtime: 120,
        genres: [{ id: 1, name: 'Action' }],
        credits: {
          cast: [
            { id: 1, name: 'Actor 1', character: 'Character 1', profile_path: '/actor1.jpg' }
          ]
        }
      }
      
      mockAxios.get.mockResolvedValue({ data: mockMovie })
      
      const result = await tmdbApi.getMovieDetails('1')
      
      expect(result).toBeDefined()
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('title')
      expect(result.title).toBe('Test Movie')
    })
  })

  describe('searchMulti', () => {
    it('should search for movies and TV shows', async () => {
      const mockResults = [
        { id: 1, title: 'Movie 1', media_type: 'movie', poster_path: '/path1.jpg', vote_average: 8.5, release_date: '2023-01-01' },
        { id: 2, name: 'TV Show 1', media_type: 'tv', poster_path: '/path2.jpg', vote_average: 7.5, first_air_date: '2023-02-01' }
      ]
      
      mockAxios.get.mockResolvedValue({ data: { results: mockResults } })
      
      const result = await tmdbApi.searchMulti('test query')
      
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(2)
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('search/multi'),
        expect.any(Object)
      )
    })
  })
})
