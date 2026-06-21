import { useState, useEffect } from 'react'
import ContentCarousel from '../components/Home/ContentCarousel'
import { tmdbApi } from '../api/tmdb'

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
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovies() {
      try {
        const data = await tmdbApi.getNowPlayingMovies()
        setMovies(data.length ? data : await tmdbApi.getTrendingMoviesToday())
      } catch (error) {
        console.warn('Movie API unavailable, using fallback data:', error)
        setMovies(fallbackMovies)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-12 text-white tracking-tight">Movies</h1>
        <ContentCarousel title="Trending Today" items={movies.slice(0, 6)} type="movie" />
        <ContentCarousel title="Latest Movies" items={movies} type="movie" />
      </div>
    </div>
  )
}
