import { useState, useEffect, memo } from 'react'
import { Link } from 'react-router-dom'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'
import { useTVDetection } from '../../hooks/useTVDetection'
import type { MovieSummary } from '../../api/tmdb'

interface HeroSliderProps {
  movies: MovieSummary[]
}

function HeroSlider({ movies }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { triggerHaptic } = useHapticFeedback()
  const isTV = useTVDetection()

  useEffect(() => {
    // Don't start timers when there are no movies
    const length = movies?.length ?? 0
    if (length === 0) return

    // Disable auto-rotation on TV to prevent hanging
    if (isTV) {
      return
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % length)
    }, 6000)
    return () => clearInterval(timer)
  }, [movies, isTV])

  if (!movies || movies.length === 0) return null

  const nextSlide = () => {
    triggerHaptic('light')
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }

  const prevSlide = () => {
    triggerHaptic('light')
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }

  const currentMovie = movies[currentIndex]

  const optimizedBackdrop = currentMovie.backdrop
    ? (currentMovie.backdrop.includes('w500')
        ? currentMovie.backdrop.replace('w500', 'w1280')
        : `${currentMovie.backdrop.replace(/\/?$/, '')}/w1280`)
    : ''

  return (
    <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out opacity-100">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${optimizedBackdrop})`,
            imageRendering: 'auto',
          } as React.CSSProperties}
        >
          <img src={optimizedBackdrop} alt={currentMovie.title} className="sr-only" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </div>

      <div className="absolute inset-0 flex items-end pb-12 md:pb-16 lg:pb-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-xl md:max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 md:mb-3 lg:mb-4 text-white tracking-tight leading-tight">
              {currentMovie.title}
            </h1>
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4 mb-3 md:mb-4 lg:mb-6 text-xs md:text-sm lg:text-base">
              <span className="text-green-400 font-semibold">{currentMovie.rating}% Match</span>
              {currentMovie.year && <span className="text-gray-400">{currentMovie.year}</span>}
            </div>
            <p className="text-gray-200 text-xs md:text-sm lg:text-lg mb-4 md:mb-6 lg:mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed">
              {currentMovie.overview}
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3 lg:gap-4">
              <Link
                to={`/movie/${currentMovie.id}`}
                className="flex items-center gap-1.5 md:gap-2 lg:gap-2 bg-white text-black px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded font-semibold text-xs md:text-sm lg:text-base transition-all duration-300 hover:bg-gray-200"
              >
                <Play className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="black" />
                Play
              </Link>
              <Link
                to={`/movie/${currentMovie.id}`}
                className="flex items-center gap-1.5 md:gap-2 lg:gap-2 bg-gray-500/70 hover:bg-gray-500/90 text-white px-4 md:px-6 lg:px-8 py-2 md:py-2.5 lg:py-3 rounded font-semibold text-xs md:text-sm lg:text-base transition-all duration-300 backdrop-blur-sm"
              >
                <Info className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        role="button"
        tabIndex={0}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all duration-300 z-10 border border-white/20 hover:border-white/40 group min-w-[40px] min-h-[40px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white transition-colors" aria-hidden="true" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        role="button"
        tabIndex={0}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all duration-300 z-10 border border-white/20 hover:border-white/40 group min-w-[40px] min-h-[40px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white transition-colors" aria-hidden="true" />
      </button>

    </div>
  )
}

export default memo(HeroSlider)
