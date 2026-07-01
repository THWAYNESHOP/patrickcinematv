import { useState, useEffect } from 'react'
import ContentCarousel from '../components/Home/ContentCarousel'
import { tmdbApi } from '../api/tmdb'
import type { MovieSummary } from '../api/tmdb'
import { useToast } from '../hooks/useToast'

export default function Anime() {
  const [anime, setAnime] = useState<MovieSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    async function fetchAnime() {
      try {
        setFetchError(null)
        const animeTitles = ['Attack on Titan', 'Demon Slayer', 'One Piece', 'Naruto', 'My Hero Academia', 'Jujutsu Kaisen', 'Dragon Ball', 'Chainsaw Man']
        const searchResults = await Promise.all(
          animeTitles.map(title => tmdbApi.searchMulti(title))
        )
        const allAnime = searchResults.flat().filter(item => item.type === 'tv')
        
        if (allAnime.length > 0) {
          setAnime(allAnime.slice(0, 20))
        } else {
          throw new Error('No anime found')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load anime.'
        console.warn('Anime search failed, using fallback data:', error)
        setFetchError('Unable to load anime content. Showing fallback items.')
        toast.error(`Anime load failed: ${message}`)
        const fallbackAnime: MovieSummary[] = [
          { id: 1429, title: 'Attack on Titan', poster: 'https://image.tmdb.org/t/p/w500/t21Ic7W6YBTURa1eLj5g3Z9Dqy.jpg', rating: '8.5', year: 2013, type: 'tv' },
          { id: 85737, title: 'Demon Slayer: Kimetsu no Yaiba', poster: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEYdB9am3cDE.jpg', rating: '8.7', year: 2019, type: 'tv' },
          { id: 37854, title: 'One Piece', poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', rating: '8.6', year: 1999, type: 'tv' },
          { id: 46852, title: 'Naruto Shippuden', poster: 'https://image.tmdb.org/t/p/w500/eG0q6XvYKzIwH7yF8pX9qZ4R3t.jpg', rating: '8.3', year: 2007, type: 'tv' },
          { id: 63926, title: 'My Hero Academia', poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', rating: '8.4', year: 2016, type: 'tv' },
          { id: 95557, title: 'Jujutsu Kaisen', poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', rating: '8.5', year: 2020, type: 'tv' },
          { id: 60625, title: 'Dragon Ball Super', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', rating: '8.2', year: 2015, type: 'tv' },
          { id: 848538, title: 'Chainsaw Man', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', rating: '8.6', year: 2022, type: 'tv' },
          { id: 119051, title: 'Spy x Family', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2022, type: 'tv' },
          { id: 31910, title: 'Bleach', poster: 'https://image.tmdb.org/t/p/w500/rugyJdeoJm7cSJL1q4jBpTNbxyU.jpg', rating: '8.2', year: 2004, type: 'tv' },
        ]
        setAnime(fallbackAnime)
      } finally {
        setLoading(false)
      }
    }

    fetchAnime()
  }, [toast])

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
                <p className="text-sm font-semibold text-primary">Anime load issue</p>
                <p className="mt-1 text-sm text-gray-200">{fetchError}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setFetchError(null)
                  setAnime([])
                  const retry = async () => {
                    try {
                      const animeTitles = ['Attack on Titan', 'Demon Slayer', 'One Piece', 'Naruto', 'My Hero Academia', 'Jujutsu Kaisen', 'Dragon Ball', 'Chainsaw Man']
                      const searchResults = await Promise.all(
                        animeTitles.map(title => tmdbApi.searchMulti(title))
                      )
                      const allAnime = searchResults.flat().filter(item => item.type === 'tv')
                      if (allAnime.length > 0) {
                        setAnime(allAnime.slice(0, 20))
                      } else {
                        throw new Error('No anime found')
                      }
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Unable to load anime.'
                      setFetchError('Unable to load anime content. Showing fallback items.')
                      toast.error(`Anime load failed: ${message}`)
                      const fallbackAnime: MovieSummary[] = [
                        { id: 1429, title: 'Attack on Titan', poster: 'https://image.tmdb.org/t/p/w500/t21Ic7W6YBTURa1eLj5g3Z9Dqy.jpg', rating: '8.5', year: 2013, type: 'tv' },
                        { id: 85737, title: 'Demon Slayer: Kimetsu no Yaiba', poster: 'https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEYdB9am3cDE.jpg', rating: '8.7', year: 2019, type: 'tv' },
                        { id: 37854, title: 'One Piece', poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', rating: '8.6', year: 1999, type: 'tv' },
                        { id: 46852, title: 'Naruto Shippuden', poster: 'https://image.tmdb.org/t/p/w500/eG0q6XvYKzIwH7yF8pX9qZ4R3t.jpg', rating: '8.3', year: 2007, type: 'tv' },
                        { id: 63926, title: 'My Hero Academia', poster: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', rating: '8.4', year: 2016, type: 'tv' },
                        { id: 95557, title: 'Jujutsu Kaisen', poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', rating: '8.5', year: 2020, type: 'tv' },
                        { id: 60625, title: 'Dragon Ball Super', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', rating: '8.2', year: 2015, type: 'tv' },
                        { id: 848538, title: 'Chainsaw Man', poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7yFJm3cDE.jpg', rating: '8.6', year: 2022, type: 'tv' },
                        { id: 119051, title: 'Spy x Family', poster: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', rating: '8.6', year: 2022, type: 'tv' },
                        { id: 31910, title: 'Bleach', poster: 'https://image.tmdb.org/t/p/w500/rugyJdeoJm7cSJL1q4jBpTNbxyU.jpg', rating: '8.2', year: 2004, type: 'tv' },
                      ]
                      setAnime(fallbackAnime)
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-12 text-white tracking-tight">Anime</h1>
        <ContentCarousel title="All Anime" items={anime} type="anime" />
      </div>
    </div>
  )
}
