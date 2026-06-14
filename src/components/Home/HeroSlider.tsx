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
    <div className="relative h-[90vh] md:h-[100vh] overflow-hidden">
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image with Parallax Effect - 4K Quality */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[10s] ease-out"
            style={{
              backgroundImage: `url(${movie.backdrop})`,
              transform: index === currentIndex ? 'scale(1.05)' : 'scale(1)',
              imageRendering: 'auto',
            }}
          />
          
          {/* Enhanced Gradient Overlays for Premium Depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-deepBlack via-deepBlack/75 to-deepBlack/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
          
          {/* Subtle Noise Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%\" height=\"100%\" filter=\"url(%23noise)\"/%3E%3C/svg%3E")',
          }} />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-6 text-white tracking-tight leading-[1.1] drop-shadow-2xl">
              {currentMovie.title}
            </h1>
            <div className="flex items-center gap-6 mb-8 text-base text-gray-200">
              <span className="flex items-center gap-2">
                <span className="text-primary font-bold text-lg">{currentMovie.rating}</span>
                <span className="text-gray-400">Rating</span>
              </span>
              {currentMovie.year && <span className="text-gray-400">•</span>}
              {currentMovie.year && <span className="font-medium">{currentMovie.year}</span>}
            </div>
            <p className="text-gray-200 text-xl md:text-2xl mb-10 line-clamp-3 leading-relaxed max-w-2xl drop-shadow-lg">
              {currentMovie.overview}
            </p>
            <div className="flex flex-wrap gap-5">
              <Link
                to={`/movie/${currentMovie.id}`}
                className="flex items-center gap-3 bg-primary hover:bg-primaryHover text-white px-10 py-4.5 rounded-xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-primary/40 hover:scale-105 hover:-translate-y-0.5"
              >
                <Play className="w-6 h-6" fill="white" />
                Watch Now
              </Link>
              <Link
                to={`/movie/${currentMovie.id}`}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-10 py-4.5 rounded-xl font-bold text-lg transition-all duration-300 backdrop-blur-md border border-white/20 hover:border-white/30 hover:scale-105 hover:-translate-y-0.5"
              >
                <Info className="w-6 h-6" />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3.5 bg-black/60 hover:bg-black/80 backdrop-blur-xl rounded-full transition-all duration-300 z-10 border border-white/10 hover:border-white/30 hover:scale-110 hover:shadow-2xl hover:shadow-black/50 group"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3.5 bg-black/60 hover:bg-black/80 backdrop-blur-xl rounded-full transition-all duration-300 z-10 border border-white/10 hover:border-white/30 hover:scale-110 hover:shadow-2xl hover:shadow-black/50 group"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
      </button>

      {/* Enhanced Dots with Glow Effect */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-primary w-10 shadow-[0_0_12px_rgba(229,9,20,0.6)]'
                : 'bg-white/30 hover:bg-white/50 w-2.5 hover:w-3'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
