import axios from 'axios'
import { getCached, setCached } from '../utils/apiCache'

const IS_PRODUCTION = import.meta.env.PROD || import.meta.env.MODE === 'production'
const TMDB_API_BASE = IS_PRODUCTION ? '/api/tmdb' : 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

function getTmdbRequestParams(extraParams: Record<string, string | number | boolean | undefined> = {}) {
  if (!IS_PRODUCTION) {
    if (!TMDB_API_KEY) {
      throw new Error('Missing VITE_TMDB_API_KEY')
    }

    return {
      api_key: TMDB_API_KEY,
      ...extraParams,
    }
  }

  return extraParams
}

// Image optimization helper - returns WebP format URLs with responsive sizing
function getOptimizedImageUrl(path: string | null | undefined, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w780'): string {
  if (!path) {
    return 'https://image.tmdb.org/t/p/w780/8cXbitsS6dWQ5gfMTZdorpAAzEd.jpg'
  }
  // TMDB automatically serves WebP when supported by the browser
  // Using original size for 4K quality backdrops
  // Add quality parameter for better compression
  return `${TMDB_IMAGE_BASE}/${size}${path}?quality=90&format=webp`
}

export interface MovieSummary {
  id: string | number
  title: string
  poster: string
  backdrop?: string
  overview?: string
  rating: string
  year?: number
  type?: 'movie' | 'tv' | 'anime' | 'sports'
  progress?: number
  popularity?: number
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

export interface PersonDetails {
  id: number
  name: string
  biography: string
  profile: string
  birthday?: string
  deathday?: string
  place_of_birth?: string
  known_for_department: string
  also_known_as?: string[]
  gender?: number
  imdb_id?: string
  homepage?: string
}

export interface PersonCredit {
  id: number
  title?: string
  name?: string
  poster: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type: 'movie' | 'tv'
  character?: string
  job?: string
  episode_count?: number
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

export interface TmdbEpisode {
  id: number
  episode_number: number
  name: string
  overview: string
  air_date: string
  runtime?: number
  still_path?: string
  vote_average?: number
}

export interface TmdbSeason {
  id: number
  season_number: number
  episode_count: number
  name: string
  overview: string
  poster_path?: string
  air_date: string
  episodes?: TmdbEpisode[]
}

function toMovieSummary(movie: TmdbMovie): MovieSummary {
  const date = movie.release_date || movie.first_air_date || ''
  const type = movie.media_type === 'tv' ? 'tv' : 'movie'

  return {
    id: movie.id,
    title: movie.title || movie.name || 'Untitled',
    poster: getOptimizedImageUrl(movie.poster_path, 'w780'),
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
  hasApiKey: IS_PRODUCTION ? true : Boolean(TMDB_API_KEY),

  async getPopularMovies(): Promise<MovieSummary[]> {
    const cacheKey = 'popular-movies'
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/movie/popular`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        page: 1,
      }),
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary(movie))
      : []
    
    setCached(cacheKey, result)
    return result
  },

  async getNowPlayingMovies(): Promise<MovieSummary[]> {
    const cacheKey = 'now-playing-movies'
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/movie/now_playing`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        page: 1,
        region: 'US',
      }),
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []

    setCached(cacheKey, result)
    return result
  },

  async getTrendingMoviesToday(): Promise<MovieSummary[]> {
    const cacheKey = 'trending-movies-today'
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/trending/movie/day`, {
      params: getTmdbRequestParams({
        language: 'en-US',
      }),
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

    const response = await axios.get(`${TMDB_API_BASE}/trending/tv/day`, {
      params: getTmdbRequestParams({
        language: 'en-US',
      }),
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

    const response = await axios.get(`${TMDB_API_BASE}/tv/popular`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        page: 1,
      }),
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

    const response = await axios.get(`${TMDB_API_BASE}/tv/top_rated`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        page: 1,
      }),
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

    const response = await axios.get(`${TMDB_API_BASE}/movie/top_rated`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        page: 1,
      }),
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []
    
    setCached(cacheKey, result)
    return result
  },

  async getMovieDetails(id: string): Promise<MediaDetails> {
    const cacheKey = `details-movie-${id}`
    const cached = getCached<MediaDetails>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/movie/${id}`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        append_to_response: 'credits',
      }),
      timeout: 10000,
    })

    const result = toMediaDetails(response.data, 'movie')
    setCached(cacheKey, result)
    return result
  },

  async getMovieRecommendations(id: string): Promise<MovieSummary[]> {
    const response = await axios.get(`${TMDB_API_BASE}/movie/${id}/recommendations`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        page: 1,
      }),
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []
  },

  async getTVDetails(id: string): Promise<MediaDetails> {
    const cacheKey = `details-tv-${id}`
    const cached = getCached<MediaDetails>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/tv/${id}`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        append_to_response: 'credits',
      }),
      timeout: 10000,
    })

    const result = toMediaDetails(response.data, 'tv')
    setCached(cacheKey, result)
    return result
  },

  async prefetchMediaDetails(item: MovieSummary): Promise<void> {
    if (item.type === 'tv' || item.type === 'anime') {
      await tmdbApi.getTVDetails(String(item.id))
      return
    }

    if (item.type === 'movie') {
      await tmdbApi.getMovieDetails(String(item.id))
      return
    }
  },

  async getTVRecommendations(id: string): Promise<MovieSummary[]> {
    const response = await axios.get(`${TMDB_API_BASE}/tv/${id}/recommendations`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        page: 1,
      }),
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []
  },

  async searchMulti(query: string): Promise<MovieSummary[]> {
    const response = await axios.get(`${TMDB_API_BASE}/search/multi`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        query,
        page: 1,
        include_adult: false,
      }),
      timeout: 10000,
    })

    return Array.isArray(response.data?.results)
      ? response.data.results
          .filter((item: TmdbMovie) => item.media_type === 'movie' || item.media_type === 'tv')
          .map((item: TmdbMovie) => toMovieSummary(item))
      : []
  },

  async getPlatformCatalog(platform: string): Promise<PlatformCatalog> {
    const cacheKey = `platform-catalog-${platform.toLowerCase()}`
    const cached = getCached<PlatformCatalog>(cacheKey)
    if (cached) return cached

    const providerId = PROVIDER_IDS[platform]

    if (!providerId) {
      const [moviesResponse, tvResponse] = await Promise.all([
        axios.get<TmdbDiscoverResponse>(`${TMDB_API_BASE}/discover/movie`, {
          params: getTmdbRequestParams({
            language: 'en-US',
            sort_by: 'popularity.desc',
            page: 1,
            region: 'US',
          }),
          timeout: 10000,
        }),
        axios.get<TmdbDiscoverResponse>(`${TMDB_API_BASE}/discover/tv`, {
          params: getTmdbRequestParams({
            language: 'en-US',
            sort_by: 'popularity.desc',
            page: 1,
            with_origin_country: 'US',
          }),
          timeout: 10000,
        }),
      ])

      const result = {
        movies: Array.isArray(moviesResponse.data?.results)
          ? moviesResponse.data.results.map((movie) => toMovieSummary({ ...movie, media_type: 'movie' }))
          : [],
        tv: Array.isArray(tvResponse.data?.results)
          ? tvResponse.data.results.map((show) => toMovieSummary({ ...show, media_type: 'tv' }))
          : [],
      }

      setCached(cacheKey, result)
      return result
    }

    const [moviesResponse, tvResponse] = await Promise.all([
      axios.get<TmdbDiscoverResponse>(`${TMDB_API_BASE}/discover/movie`, {
        params: getTmdbRequestParams({
          language: 'en-US',
          sort_by: 'popularity.desc',
          page: 1,
          with_watch_providers: providerId,
          watch_region: 'US',
        }),
        timeout: 10000,
      }),
      axios.get<TmdbDiscoverResponse>(`${TMDB_API_BASE}/discover/tv`, {
        params: getTmdbRequestParams({
          language: 'en-US',
          sort_by: 'popularity.desc',
          page: 1,
          with_watch_providers: providerId,
          watch_region: 'US',
        }),
        timeout: 10000,
      }),
    ])

    const result = {
      movies: Array.isArray(moviesResponse.data?.results)
        ? moviesResponse.data.results.map((movie) => toMovieSummary({ ...movie, media_type: 'movie' }))
        : [],
      tv: Array.isArray(tvResponse.data?.results)
        ? tvResponse.data.results.map((show) => toMovieSummary({ ...show, media_type: 'tv' }))
        : [],
    }

    setCached(cacheKey, result)
    return result
  },

  async getMoviesByGenre(genreId: number): Promise<MovieSummary[]> {
    const cacheKey = `movies-genre-${genreId}`
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/discover/movie`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: 1,
        with_genres: genreId,
      }),
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []

    setCached(cacheKey, result)
    return result
  },

  async getTVByOriginCountry(country: string): Promise<MovieSummary[]> {
    const cacheKey = `tv-origin-${country}`
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/discover/tv`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: 1,
        with_origin_country: country,
      }),
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []

    setCached(cacheKey, result)
    return result
  },

  async getNewReleases(): Promise<MovieSummary[]> {
    const [moviesResponse, tvResponse] = await Promise.all([
      axios.get(`${TMDB_API_BASE}/discover/movie`, {
        params: getTmdbRequestParams({
          language: 'en-US',
          sort_by: 'release_date.desc',
          page: 1,
          'release_date.lte': new Date().toISOString().split('T')[0],
          'release_date.gte': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }),
        timeout: 10000,
      }),
      axios.get(`${TMDB_API_BASE}/discover/tv`, {
        params: getTmdbRequestParams({
          language: 'en-US',
          sort_by: 'first_air_date.desc',
          page: 1,
          'first_air_date.lte': new Date().toISOString().split('T')[0],
          'first_air_date.gte': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        }),
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
    const cacheKey = `tv-genre-${genreId}`
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/discover/tv`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        sort_by: 'popularity.desc',
        page: 1,
        with_genres: genreId,
      }),
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []

    setCached(cacheKey, result)
    return result
  },

  async discoverMovies(params: Record<string, string | number | boolean | undefined>): Promise<MovieSummary[]> {
    const cacheKey = `discover-movies-${JSON.stringify(params)}`
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/discover/movie`, {
      params: getTmdbRequestParams(params),
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((movie: TmdbMovie) => toMovieSummary({ ...movie, media_type: 'movie' }))
      : []

    setCached(cacheKey, result)
    return result
  },

  async discoverTV(params: Record<string, string | number | boolean | undefined>): Promise<MovieSummary[]> {
    const cacheKey = `discover-tv-${JSON.stringify(params)}`
    const cached = getCached<MovieSummary[]>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/discover/tv`, {
      params: getTmdbRequestParams(params),
      timeout: 10000,
    })

    const result = Array.isArray(response.data?.results)
      ? response.data.results.map((show: TmdbMovie) => toMovieSummary({ ...show, media_type: 'tv' }))
      : []

    setCached(cacheKey, result)
    return result
  },

  async getMovieVideos(id: string): Promise<TmdbVideo[]> {
    const response = await axios.get(`${TMDB_API_BASE}/movie/${id}/videos`, {
      params: getTmdbRequestParams({
        language: 'en-US',
      }),
      timeout: 10000,
    })

    return Array.isArray(response.data?.results) ? response.data.results : []
  },

  async getTVVideos(id: string): Promise<TmdbVideo[]> {
    const response = await axios.get(`${TMDB_API_BASE}/tv/${id}/videos`, {
      params: getTmdbRequestParams({
        language: 'en-US',
      }),
      timeout: 10000,
    })

    return Array.isArray(response.data?.results) ? response.data.results : []
  },

  async getTVSeasonDetails(tvId: string, seasonNumber: number): Promise<TmdbSeason> {
    const cacheKey = `tv-season-${tvId}-${seasonNumber}`
    const cached = getCached<TmdbSeason>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/tv/${tvId}/season/${seasonNumber}`, {
      params: getTmdbRequestParams({
        language: 'en-US',
      }),
      timeout: 10000,
    })

    setCached(cacheKey, response.data)
    return response.data
  },

  async getTVEpisodeDetails(tvId: string, seasonNumber: number, episodeNumber: number): Promise<TmdbEpisode> {
    const cacheKey = `tv-episode-${tvId}-${seasonNumber}-${episodeNumber}`
    const cached = getCached<TmdbEpisode>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {
      params: getTmdbRequestParams({
        language: 'en-US',
      }),
      timeout: 10000,
    })

    setCached(cacheKey, response.data)
    return response.data
  },

  async getPersonDetails(personId: number): Promise<PersonDetails> {
    const cacheKey = `person-details-${personId}`
    const cached = getCached<PersonDetails>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/person/${personId}`, {
      params: getTmdbRequestParams({
        language: 'en-US',
      }),
      timeout: 10000,
    })

    const data = response.data
    const result: PersonDetails = {
      id: data.id,
      name: data.name,
      biography: data.biography || 'No biography available.',
      profile: data.profile_path ? getOptimizedImageUrl(data.profile_path, 'w500') : 'https://via.placeholder.com/300x450?text=No+Image',
      birthday: data.birthday,
      deathday: data.deathday,
      place_of_birth: data.place_of_birth,
      known_for_department: data.known_for_department,
      also_known_as: data.also_known_as,
      gender: data.gender,
      imdb_id: data.imdb_id,
      homepage: data.homepage,
    }

    setCached(cacheKey, result)
    return result
  },

  async getPersonCredits(personId: number): Promise<PersonCredit[]> {
    const cacheKey = `person-credits-${personId}`
    const cached = getCached<PersonCredit[]>(cacheKey)
    if (cached) return cached

    const response = await axios.get(`${TMDB_API_BASE}/person/${personId}/combined_credits`, {
      params: getTmdbRequestParams({
        language: 'en-US',
      }),
      timeout: 10000,
    })

    interface TmdbCreditResponse {
      id: number
      title?: string
      name?: string
      poster_path?: string | null
      release_date?: string
      first_air_date?: string
      vote_average?: number
      media_type: 'movie' | 'tv'
      character?: string
      job?: string
      episode_count?: number
    }

    const credits = Array.isArray(response.data?.cast) ? response.data.cast : []
    const result: PersonCredit[] = credits
      .filter((credit: TmdbCreditResponse) => credit.media_type === 'movie' || credit.media_type === 'tv')
      .map((credit: TmdbCreditResponse) => ({
        id: credit.id,
        title: credit.title,
        name: credit.name,
        poster: credit.poster_path ? getOptimizedImageUrl(credit.poster_path, 'w500') : 'https://via.placeholder.com/300x450?text=No+Image',
        release_date: credit.release_date,
        first_air_date: credit.first_air_date,
        vote_average: credit.vote_average,
        media_type: credit.media_type,
        character: credit.character,
        job: credit.job,
        episode_count: credit.episode_count,
      }))
      .sort((a: PersonCredit, b: PersonCredit) => {
        const dateA = a.release_date || a.first_air_date || ''
        const dateB = b.release_date || b.first_air_date || ''
        return dateB.localeCompare(dateA)
      })

    setCached(cacheKey, result)
    return result
  },

  async searchPeople(query: string): Promise<PersonDetails[]> {
    const response = await axios.get(`${TMDB_API_BASE}/search/person`, {
      params: getTmdbRequestParams({
        language: 'en-US',
        query,
        page: 1,
        include_adult: false,
      }),
      timeout: 10000,
    })

    interface TmdbPersonResponse {
      id: number
      name: string
      biography?: string
      profile_path?: string | null
      known_for_department?: string
    }

    return Array.isArray(response.data?.results)
      ? response.data.results.map((person: TmdbPersonResponse) => ({
          id: person.id,
          name: person.name,
          biography: person.biography || '',
          profile: person.profile_path ? getOptimizedImageUrl(person.profile_path, 'w500') : 'https://via.placeholder.com/300x450?text=No+Image',
          known_for_department: person.known_for_department,
        }))
      : []
  },
}
