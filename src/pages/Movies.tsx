import { useState, useEffect } from 'react'
import ContentCarousel from '../components/Home/ContentCarousel'
import { tmdbApi } from '../api/tmdb'
import type { MovieSummary } from '../api/tmdb'
import { useToast } from '../hooks/useToast'

const fallbackMovies = [
  {
    id: 1078605,
    title: 'Test Movie',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    rating: '8.0',
    year: 2024,
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    rating: '8.2',
    year: 2024,
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    rating: '8.1',
    year: 2023,
  },
  {
    id: 157336,
    title: 'Interstellar',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: '8.4',
    year: 2014,
  },
  {
    id: 299536,
    title: 'Avengers: Infinity War',
    poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    rating: '8.2',
    year: 2018,
  },
  {
    id: 550,
    title: 'Fight Club',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    rating: '8.4',
    year: 1999,
  },
  {
    id: 155,
    title: 'The Dark Knight',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    rating: '8.5',
    year: 2008,
  },
]

export default function Movies() {
  const [trending, setTrending] = useState<MovieSummary[]>([])
  const [nowPlaying, setNowPlaying] = useState<MovieSummary[]>([])
  const [popular, setPopular] = useState<MovieSummary[]>([])
  const [topRated, setTopRated] = useState<MovieSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    async function fetchMovies() {
      try {
        setFetchError(null)
        const [trendingData, nowPlayingData, popularData, topRatedData] = await Promise.all([
          tmdbApi.getTrendingMoviesToday().catch(() => []),
          tmdbApi.getNowPlayingMovies().catch(() => []),
          tmdbApi.getPopularMovies().catch(() => []),
          tmdbApi.getTopRatedMovies().catch(() => []),
        ])
        
        setTrending(trendingData.length ? trendingData : fallbackMovies)
        setNowPlaying(nowPlayingData.length ? nowPlayingData : fallbackMovies)
        setPopular(popularData.length ? popularData : fallbackMovies)
        setTopRated(topRatedData.length ? topRatedData : fallbackMovies)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load movies.'
        console.warn('Movie API unavailable, using fallback data:', error)
        setFetchError('Unable to load movie lists. Showing fallback content.')
        toast.error(`Movies load failed: ${message}`)
        setTrending(fallbackMovies)
        setNowPlaying(fallbackMovies)
        setPopular(fallbackMovies)
        setTopRated(fallbackMovies)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [toast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deepBlack">
        <div className="relative mb-6">
          <div className="animate-spin w-16 h-16 md:w-20 md:h-20 border-4 border-primary/30 border-t-primary rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-full animate-pulse" />
          </div>
        </div>
        <p className="text-white text-lg md:text-xl font-semibold animate-pulse">Loading Movies...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16">
      <div className="container mx-auto">
        {fetchError && (
          <section className="mb-8">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">Movie load issue</p>
                <p className="mt-1 text-sm text-gray-200">{fetchError}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setFetchError(null)
                  setTrending([])
                  setNowPlaying([])
                  setPopular([])
                  setTopRated([])
                  const fetch = async () => {
                    try {
                      const [trendingData, nowPlayingData, popularData, topRatedData] = await Promise.all([
                        tmdbApi.getTrendingMoviesToday().catch(() => []),
                        tmdbApi.getNowPlayingMovies().catch(() => []),
                        tmdbApi.getPopularMovies().catch(() => []),
                        tmdbApi.getTopRatedMovies().catch(() => []),
                      ])
                      setTrending(trendingData.length ? trendingData : fallbackMovies)
                      setNowPlaying(nowPlayingData.length ? nowPlayingData : fallbackMovies)
                      setPopular(popularData.length ? popularData : fallbackMovies)
                      setTopRated(topRatedData.length ? topRatedData : fallbackMovies)
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Unable to load movies.'
                      setFetchError('Unable to load movie lists. Showing fallback content.')
                      toast.error(`Movies load failed: ${message}`)
                      setTrending(fallbackMovies)
                      setNowPlaying(fallbackMovies)
                      setPopular(fallbackMovies)
                      setTopRated(fallbackMovies)
                    } finally {
                      setLoading(false)
                    }
                  }
                  void fetch()
                }}
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primaryHover"
              >
                Retry
              </button>
            </div>
          </section>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-12 text-white tracking-tight">Movies</h1>
        <ContentCarousel title="Trending Today" items={trending} type="movie" />
        <ContentCarousel title="Now Playing" items={nowPlaying} type="movie" />
        <ContentCarousel title="Popular" items={popular} type="movie" />
        <ContentCarousel title="Top Rated" items={topRated} type="movie" />
      </div>
    </div>
  )
}
