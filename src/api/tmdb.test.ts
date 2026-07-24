import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { tmdbApi } from './tmdb'
import axios from 'axios'

// Mock axios
vi.mock('axios')

describe('TMDB API', () => {
  const mockAxios = vi.mocked(axios)

  beforeEach(() => {
    vi.clearAllMocks()
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
