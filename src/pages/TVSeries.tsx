import { useState, useEffect } from 'react'
import ContentCarousel from '../components/Home/ContentCarousel'
import { getCached } from '../utils/apiCache'
import { tmdbApi } from '../api/tmdb'
import type { MovieSummary } from '../api/tmdb'
import { useToast } from '../hooks/useToast'
import { usePageState } from '../hooks/usePageState'

const fallbackSeries = [
  {
    id: 119051,
    title: 'Vidking Test Series',
    poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J8ED.jpg',
    rating: '8.3',
    year: 2021,
  },
  {
    id: 1396,
    title: 'Breaking Bad',
    poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    rating: '8.9',
    year: 2008,
  },
  {
    id: 1399,
    title: 'Game of Thrones',
    poster: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
    rating: '8.4',
    year: 2011,
  },
  {
    id: 66732,
    title: 'Stranger Things',
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    rating: '8.6',
    year: 2016,
  },
  {
    id: 100088,
    title: 'The Last of Us',
    poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J8ED.jpg',
    rating: '8.6',
    year: 2023,
  },
  {
    id: 76479,
    title: 'The Boys',
    poster: 'https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg',
    rating: '8.4',
    year: 2019,
  },
]

export default function TVSeries() {

  const cachedTrending = getCached<MovieSummary[]>('trending-tv-today')
  const cachedPopular = getCached<MovieSummary[]>('popular-tv')
  const cachedTopRated = getCached<MovieSummary[]>('top-rated-tv')

  const [trending, setTrending] = useState<MovieSummary[]>(cachedTrending || [])
  const [popular, setPopular] = useState<MovieSummary[]>(cachedPopular || [])
  const [topRated, setTopRated] = useState<MovieSummary[]>(cachedTopRated || [])
  const [loading, setLoading] = useState(
    !cachedTrending && !cachedPopular && !cachedTopRated
  )
  const [fetchError, setFetchError] = useState<string | null>(null)
  const toast = useToast()
  const { getCarouselPosition, setCarouselPosition, getFocusedCardId, setFocusedCardId } = usePageState('TVSeries')
  const carouselStateProps = {
    getCarouselPosition,
    setCarouselPosition,
    getFocusedCardId,
    setFocusedCardId,
    onPrefetch: tmdbApi.prefetchMediaDetails,
  }

  useEffect(() => {
    if (cachedTrending && cachedPopular && cachedTopRated) {
      return
    }

    async function fetchSeries() {
      try {
        setFetchError(null)
        const [trendingData, popularData, topRatedData] = await Promise.all([
          tmdbApi.getTrendingTVToday().catch(() => []),
          tmdbApi.getPopularTV().catch(() => []),
          tmdbApi.getTopRatedTV().catch(() => []),
        ])
        
        setTrending(trendingData.length ? trendingData : fallbackSeries)
        setPopular(popularData.length ? popularData : fallbackSeries)
        setTopRated(topRatedData.length ? topRatedData : fallbackSeries)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load TV shows.'
        console.warn('TV API unavailable, using fallback data:', error)
        setFetchError('Unable to load TV series lists. Showing fallback content.')
        toast.error(`TV load failed: ${message}`)
        setTrending(fallbackSeries)
        setPopular(fallbackSeries)
        setTopRated(fallbackSeries)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [toast])

  if (loading) {
    return (
      <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16 bg-deepBlack">
        <div className="container mx-auto space-y-12">
          <div className="h-10 w-56 rounded-full bg-gray-800 animate-pulse" />
          <ContentCarousel title="Trending Today" items={[]} type="tv" loading />
          <ContentCarousel title="Popular" items={[]} type="tv" loading />
          <ContentCarousel title="Top Rated" items={[]} type="tv" loading />
        </div>
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
                <p className="text-sm font-semibold text-primary">TV series load issue</p>
                <p className="mt-1 text-sm text-gray-200">{fetchError}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setFetchError(null)
                  setTrending([])
                  setPopular([])
                  setTopRated([])
                  const fetch = async () => {
                    try {
                      const [trendingData, popularData, topRatedData] = await Promise.all([
                        tmdbApi.getTrendingTVToday().catch(() => []),
                        tmdbApi.getPopularTV().catch(() => []),
                        tmdbApi.getTopRatedTV().catch(() => []),
                      ])
                      setTrending(trendingData.length ? trendingData : fallbackSeries)
                      setPopular(popularData.length ? popularData : fallbackSeries)
                      setTopRated(topRatedData.length ? topRatedData : fallbackSeries)
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Unable to load TV shows.'
                      setFetchError('Unable to load TV series lists. Showing fallback content.')
                      toast.error(`TV load failed: ${message}`)
                      setTrending(fallbackSeries)
                      setPopular(fallbackSeries)
                      setTopRated(fallbackSeries)
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

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-12 text-white tracking-tight">TV Series</h1>
        <ContentCarousel title="Trending Today" items={trending} type="tv" carouselId="tvseries-trending-today" {...carouselStateProps} />
        <ContentCarousel title="Popular" items={popular} type="tv" carouselId="tvseries-popular" {...carouselStateProps} />
        <ContentCarousel title="Top Rated" items={topRated} type="tv" carouselId="tvseries-top-rated" {...carouselStateProps} />
      </div>
    </div>
  )
}
