import { useState, useEffect } from 'react'
import ContentCarousel from '../components/Home/ContentCarousel'
import { tmdbApi } from '../api/tmdb'

export default function Anime() {
  const [anime, setAnime] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnime() {
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
        console.warn('Anime search failed, using fallback data:', error)
        const fallbackAnime = [
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
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white tracking-tight">Anime</h1>
        <ContentCarousel title="All Anime" items={anime} type="anime" />
      </div>
    </div>
  )
}
