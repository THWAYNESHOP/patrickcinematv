import axios from 'axios'
import { getCached, setCached } from '../utils/apiCache'

const TMDB_API_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

// Image optimization helper - returns WebP format URLs
function getOptimizedImageUrl(path: string | null | undefined, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string {
  if (!path) {
    return 'https://image.tmdb.org/t/p/w500/8cXbitsS6dWQ5gfMTZdorpAAzEd.jpg'
  }
  // TMDB automatically serves WebP when supported by the browser
  // Using original size for 4K quality backdrops
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export interface MovieSummary {
  id: number
  title: string
  poster: string
  backdrop?: string
  overview?: string
  rating: string
  year?: number
  type?: 'movie' | 'tv'
}

export interface PlatformCatalog {
  movies: MovieSummary[]
  tv: MovieSummary[]
}

export interface MediaDetails extends MovieSummary {
  backdrop: string
  overview: string
  runtime?: string
  seasons?: number
  genres: string[]
  cast: CastMember[]
  imdbId?: string
}

export interface CastMember {
  id?: number
  name: string
  character?: string
  profile?: string
}

interface TmdbMovie {
  id: number
  imdb_id?: string
  title?: string
  name?: string
  poster_path?: string
  backdrop_path?: string
  vote_average?: number
  release_date?: string
  first_air_date?: string
  media_type?: 'movie' | 'tv' | 'person'
  overview?: string
  runtime?: number
  number_of_seasons?: number
  genres?: Array<{ id: number; name: string }>
  credits?: {
    cast?: Array<{
      id?: number
      name: string
      character?: string
      profile_path?: string
    }>
  }
}

interface TmdbDiscoverResponse {
  results?: TmdbMovie[]
}

interface TmdbVideo {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

function toMovieSummary(movie: TmdbMovie): MovieSummary {
  const date = movie.release_date || movie.first_air_date || ''
  const type = movie.media_type === 'tv' ? 'tv' : 'movie'

  return {
    id: movie.id,
    title: movie.title || movie.name || 'Untitled',
    poster: getOptimizedImageUrl(movie.poster_path, 'w500'),
    backdrop: movie.backdrop_path ? getOptimizedImageUrl(movie.backdrop_path, 'original') : undefined,
    overview: movie.overview,
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
    year: date ? Number(date.slice(0, 4)) : undefined,
    type,
  }
}

function toMediaDetails(media: TmdbMovie, type: 'movie' | 'tv'): MediaDetails {
  const summary = toMovieSummary({ ...media, media_type: type })

  return {
    ...summary,
    type,
    backdrop: summary.backdrop || summary.poster,
    overview: media.overview || 'No overview available.',
    runtime: media.runtime ? `${media.runtime} min` : undefined,
    seasons: media.number_of_seasons,
    genres: media.genres?.map((genre) => genre.name) || [],
    cast: media.credits?.cast?.slice(0, 8).map((person) => ({
      id: person.id,
      name: person.name,
      character: person.character,
      profile: person.profile_path ? getOptimizedImageUrl(person.profile_path, 'w185') : undefined,
    })) || [],
    imdbId: media.imdb_id,
  }
}

const PROVIDER_IDS: Record<string, number> = {
  Netflix: 8,
  'Prime Video': 9,
  'Paramount+': 531,
  'Apple TV+': 350,
  Hulu: 15,
  'Disney+': 337,
}

export const tmdbApi = {
  hasApiKey: Boolean(TMDB_API_KEY),

  async getPopularMovies(): Promise<MovieSummary[]> {
    const cacheKey = 'popular-movies'
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      },
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary(movie))
      : []
    
    setCached(cacheKey, result)
    return result
  },

  async getNowPlayingMovies(): Promise<MovieSummary[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/movie/now_playing`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
        region: 'US',
      },
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []
  },

  async getTrendingMoviesToday(): Promise<MovieSummary[]> {
    const cacheKey = 'trending-movies-today'
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/trending/movie/day`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
      },
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []
    
    setCached(cacheKey, result)
    return result
  },

  async getTrendingTVToday(): Promise<MovieSummary[]> {
    const cacheKey = 'trending-tv-today'
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/trending/tv/day`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
      },
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []
    
    setCached(cacheKey, result)
    return result
  },

  async getPopularTV(): Promise<MovieSummary[]> {
    const cacheKey = 'popular-tv'
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/tv/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      },
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []
    
    setCached(cacheKey, result)
    return result
  },

  async getTopRatedTV(): Promise<MovieSummary[]> {
    const cacheKey = 'top-rated-tv'
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/tv/top_rated`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      },
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []
    
    setCached(cacheKey, result)
    return result
  },

  async getTopRatedMovies(): Promise<MovieSummary[]> {
    const cacheKey = 'top-rated-movies'
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/movie/top_rated`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      },
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []
    
    setCached(cacheKey, result)
    return result
  },

  async getMovieDetails(id: string): Promise<MediaDetails> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        append_to_response: 'credits',
      },
      timeout: 10000,
    })

    return toMediaDetails(response.data, 'movie')
  },

  async getMovieRecommendations(id: string): Promise<MovieSummary[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/movie/${id}/recommendations`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      },
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []
  },

  async getTVDetails(id: string): Promise<MediaDetails> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/tv/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        append_to_response: 'credits',
      },
      timeout: 10000,
    })

    return toMediaDetails(response.data, 'tv')
  },

  async getTVRecommendations(id: string): Promise<MovieSummary[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/tv/${id}/recommendations`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      },
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []
  },

  async searchMulti(query: string): Promise<MovieSummary[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/search/multi`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        query,
        page: 1,
        include_adult: false,
      },
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results
          .filter((item: TmdbMovie) => item.media_type === 'movie' || item.media_type === 'tv')
          .map((item: TmdbMovie) => toMovieSummary(item))
      : []
  },

  async getPlatformCatalog(platform: string): Promise<PlatformCatalog> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const providerId = PROVIDER_IDS[platform]

    if (!providerId) {
      const [moviesResponse, tvResponse] = await Promise.all([
        axios.get<TmdbDiscoverResponse>(`${TMDB_API_BASE}/discover/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            language: 'en-US',
            sort_by: 'popularity.desc',
            page: 1,
            region: 'US',
          },
          timeout: 10000,
        }),
        axios.get<TmdbDiscoverResponse>(`${TMDB_API_BASE}/discover/tv`, {
          params: {
            api_key: TMDB_API_KEY,
            language: 'en-US',
            sort_by: 'popularity.desc',
            page: 1,
            with_origin_country: 'US',
          },
          timeout: 10000,
        }),
      ])

      return {
        movies: Array.isArray(moviesResponse.data?.results)
          ? moviesResponse.data.results.map((movie) => toMovieSummary({ ...movie, media_type: 'movie' }))
          : [],
        tv: Array.isArray(tvResponse.data?.results)
          ? tvResponse.data.results.map((show) => toMovieSummary({ ...show, media_type: 'tv' }))
          : [],
      }
    }

    const [moviesResponse, tvResponse] = await Promise.all([
      axios.get<TmdbDiscoverResponse>(`${TMDB_API_BASE}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          sort_by: 'popularity.desc',
          page: 1,
          with_watch_providers: providerId,
          watch_region: 'US',
        },
        timeout: 10000,
      }),
      axios.get<TmdbDiscoverResponse>(`${TMDB_API_BASE}/discover/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          sort_by: 'popularity.desc',
          page: 1,
          with_watch_providers: providerId,
          watch_region: 'US',
        },
        timeout: 10000,
      }),
    ])

    return {
      movies: Array.isArray(moviesResponse.data?.results)
        ? moviesResponse.data.results.map((movie) => toMovieSummary({ ...movie, media_type: 'movie' }))
        : [],
      tv: Array.isArray(tvResponse.data?.results)
        ? tvResponse.data.results.map((show) => toMovieSummary({ ...show, media_type: 'tv' }))
        : [],
    }
  },

  async getMoviesByGenre(genreId: number): Promise<MovieSummary[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: 1,
        with_genres: genreId,
      },
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []
  },

  async getTVByOriginCountry(country: string): Promise<MovieSummary[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/discover/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: 1,
        with_origin_country: country,
      },
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []
  },

  async getNewReleases(): Promise<MovieSummary[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const [moviesResponse, tvResponse] = await Promise.all([
      axios.get(`${TMDB_API_BASE}/discover/movie`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          sort_by: 'release_date.desc',
          page: 1,
          'release_date.lte': new Date().toISOString().split('T')[0],
          'release_date.gte': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        timeout: 10000,
      }),
      axios.get(`${TMDB_API_BASE}/discover/tv`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
          sort_by: 'first_air_date.desc',
          page: 1,
          'first_air_date.lte': new Date().toISOString().split('T')[0],
          'first_air_date.gte': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        timeout: 10000,
      }),
    ])

    const movies = Array.isArray(moviesResponse.data?.results)
      ? moviesResponse.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []
    const tv = Array.isArray(tvResponse.data?.results)
      ? tvResponse.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []

    return [...movies, ...tv].slice(0, 20)
  },

  async getTVByGenre(genreId: number): Promise<MovieSummary[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/discover/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: 1,
        with_genres: genreId,
      },
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []
  },

  async getMovieVideos(id: string): Promise<TmdbVideo[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/movie/${id}/videos`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
      },
      timeout: 10000,
    })

    console.log("Movie Videos Response:", response.data?.results)
    return Array.isArray(response.data?.results) ? response.data.results : []
  },

  async getTVVideos(id: string): Promise<TmdbVideo[]> {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    const response = await axios.get(`${TMDB_API_BASE}/tv/${id}/videos`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
      },
      timeout: 10000,
    })

    console.log("TV Videos Response:", response.data?.results)
    return Array.isArray(response.data?.results) ? response.data.results : []
  },
}
