import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroSliderProps {
  movies: any[]
}

export default function HeroSlider({ movies }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [movies.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }

  const currentMovie = movies[currentIndex]

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${movie.backdrop})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-deepBlack via-deepBlack/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-transparent to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 neon-text animate-float">
              {currentMovie.title}
            </h1>
            <p className="text-gray-300 text-lg mb-6 line-clamp-3">
              {currentMovie.overview}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={`/movie/${currentMovie.id}`}
                className="flex items-center gap-2 bg-neonPink hover:bg-neonPinkLight text-white px-8 py-3 rounded-lg font-semibold transition-colors neon-glow"
              >
                <Play className="w-5 h-5" />
                Watch Now
              </Link>
              <Link
                to={`/movie/${currentMovie.id}`}
                className="flex items-center gap-2 glass hover:bg-white/10 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                <Info className="w-5 h-5" />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full hover:bg-white/20 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full hover:bg-white/20 transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-neonPink w-8 neon-glow'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
