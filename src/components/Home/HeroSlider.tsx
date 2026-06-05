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
    }, 6000)
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
    <div className="relative h-[75vh] md:h-[85vh] overflow-hidden">
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url(${movie.backdrop})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-deepBlack via-deepBlack/60 to-deepBlack/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/40 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white tracking-tight leading-tight">
              {currentMovie.title}
            </h1>
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <span className="text-primary font-semibold">{currentMovie.rating}</span>
                <span>Rating</span>
              </span>
              {currentMovie.year && <span>{currentMovie.year}</span>}
            </div>
            <p className="text-gray-300 text-lg mb-8 line-clamp-3 leading-relaxed">
              {currentMovie.overview}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={`/movie/${currentMovie.id}`}
                className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Play className="w-5 h-5" />
                Watch Now
              </Link>
              <Link
                to={`/movie/${currentMovie.id}`}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-white/20"
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
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all duration-300 z-10 border border-white/10 hover:border-white/20"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all duration-300 z-10 border border-white/10 hover:border-white/20"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary w-8'
                : 'bg-white/30 hover:bg-white/50 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
