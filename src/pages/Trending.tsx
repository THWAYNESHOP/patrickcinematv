import { useState, useEffect } from 'react'
import ContentCarousel from '../components/Home/ContentCarousel'
import { getCached } from '../utils/apiCache'
import { tmdbApi } from '../api/tmdb'
import { useToast } from '../hooks/useToast'

import type { MovieSummary } from '../api/tmdb'

const fallbackTrending = [
  { id: 1078605, title: 'Test Movie', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', rating: '8.0', year: 2024 },
  { id: 693134, title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', rating: '8.2', year: 2024 },
  { id: 872585, title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', rating: '8.1', year: 2023 },
  { id: 157336, title: 'Interstellar', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', rating: '8.4', year: 2014 },
  { id: 299536, title: 'Avengers: Infinity War', poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', rating: '8.2', year: 2018 },
  { id: 550, title: 'Fight Club', poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', rating: '8.4', year: 1999 },
]

export default function Trending() {
  const cachedTrending = getCached<MovieSummary[]>('trending-movies-today')
  const [trending, setTrending] = useState<MovieSummary[]>(cachedTrending || [])
  const [loading, setLoading] = useState(!cachedTrending)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    if (cachedTrending) {
      return
    }

    async function fetchTrending() {
      try {
        setFetchError(null)
        const data = await tmdbApi.getTrendingMoviesToday()
        setTrending(data.length ? data : fallbackTrending as MovieSummary[])
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load trending movies.'
        console.warn('Trending API unavailable, using fallback data:', error)
        setFetchError('Unable to load trending movies. Showing fallback content.')
        toast.error(`Trending load failed: ${message}`)
        setTrending(fallbackTrending)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [cachedTrending, toast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
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
                <p className="text-sm font-semibold text-primary">Trending load issue</p>
                <p className="mt-1 text-sm text-gray-200">{fetchError}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setFetchError(null)
                  const retry = async () => {
                    try {
                      const data = await tmdbApi.getTrendingMoviesToday()
                      setTrending(data.length ? data : fallbackTrending)
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Unable to load trending movies.'
                      setFetchError('Unable to load trending movies. Showing fallback content.')
                      toast.error(`Trending load failed: ${message}`)
                      setTrending(fallbackTrending)
                    } finally {
                      setLoading(false)
                    }
                  }
                  void retry()
                }}
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primaryHover"
              >
                Retry
              </button>
            </div>
          </section>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-12 text-white tracking-tight">Trending</h1>
        <ContentCarousel title="Trending Movies Today" items={trending} type="movie" />
      </div>
    </div>
  )
}
