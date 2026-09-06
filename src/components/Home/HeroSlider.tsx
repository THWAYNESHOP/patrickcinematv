import { useState, useEffect, memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'
import { useTVDetection } from '../../hooks/useTVDetection'
import { useStore } from '../../store/useStore'
import type { MovieSummary } from '../../api/tmdb'

interface HeroSliderProps {
  movies: MovieSummary[]
}

function getOptimizedBackdrop(backdrop?: string) {
  if (!backdrop) return ''
  return backdrop.replace(/\/(original|w\d+)\//, '/w1280/')
}

function formatRating(rating?: string) {
  const score = Number(rating)
  return Number.isFinite(score) && score > 0 ? score.toFixed(1) : null
}

function HeroSlider({ movies }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const { triggerHaptic } = useHapticFeedback()
  const isTV = useTVDetection()
  const user = useStore((state) => state.user)
  const setIsAuthModalOpen = useStore((state) => state.setIsAuthModalOpen)
  const setPendingCardNavigation = useStore((state) => state.setPendingCardNavigation)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleCardClick = useCallback(
    (e?: React.MouseEvent<HTMLElement>) => {
      // Check if user is logged in
      if (!user) {
        e?.preventDefault()
        e?.stopPropagation()

        // Store the pending navigation and open auth modal
        const movie = movies[currentIndex]
        setPendingCardNavigation({
          type: 'movie',
          id: String(movie.id),
        })
        setIsAuthModalOpen(true)
      }
    },
    [user, movies, currentIndex, setPendingCardNavigation, setIsAuthModalOpen],
  )

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
  const rating = formatRating(currentMovie.rating)
  const optimizedBackdrop = getOptimizedBackdrop(currentMovie.backdrop)

  return (
    <div className="relative h-[64vh] md:h-[68vh] lg:h-[68vh] overflow-hidden bg-black">
      <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear hover:scale-110"
          style={{
            backgroundImage: `url(${optimizedBackdrop})`,
          } as React.CSSProperties}
        >
          <img src={optimizedBackdrop} alt={currentMovie.title} className="sr-only" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-black/10 z-[5]" />
      </div>

      <div className="absolute inset-0 flex items-end pb-8 md:pb-12 z-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="max-w-2xl">
            <h1 className="max-w-2xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-5 text-white tracking-tight leading-[0.95] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {currentMovie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm md:text-base font-bold">
              {rating && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
                  <Star className="h-4 w-4 fill-white" />
                  {rating}
                </span>
              )}
              {currentMovie.year && <span className="text-white/90">{currentMovie.year}</span>}
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-primary tracking-widest uppercase text-[10px] md:text-xs">Trending Today</span>
            </div>

            <p className="text-gray-300 text-sm md:text-base lg:text-lg mb-10 line-clamp-3 md:line-clamp-4 leading-relaxed max-w-xl font-medium drop-shadow-lg opacity-80">
              {currentMovie.overview}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to={`/movie/${currentMovie.id}`}
                onClick={(e) => !user && handleCardClick(e)}
                className="flex items-center gap-3 bg-white text-black px-6 md:px-10 py-3.5 md:py-4 rounded-xl font-black text-sm md:text-base transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 shadow-2xl shadow-white/10"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                PLAY
              </Link>
              <Link
                to={`/movie/${currentMovie.id}`}
                onClick={(e) => !user && handleCardClick(e)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-6 md:px-10 py-3.5 md:py-4 rounded-xl font-black text-sm md:text-base transition-all duration-300 backdrop-blur-2xl border border-white/20 hover:border-white/40 shadow-2xl"
              >
                <Info className="w-5 h-5" />
                SEE MORE
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
        className="absolute left-2 top-[34%] -translate-y-1/2 p-2 md:left-4 md:top-1/2 md:p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all duration-300 z-10 border border-white/20 hover:border-white/40 group min-w-[40px] min-h-[40px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white transition-colors" aria-hidden="true" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        role="button"
        tabIndex={0}
        className="absolute right-2 top-[34%] -translate-y-1/2 p-2 md:right-4 md:top-1/2 md:p-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full transition-all duration-300 z-10 border border-white/20 hover:border-white/40 group min-w-[40px] min-h-[40px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white transition-colors" aria-hidden="true" />
      </button>

      {movies.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-6">
          {movies.map((movie, index) => (
            <button
              key={movie.id}
              type="button"
              onClick={() => {
                triggerHaptic('light')
                setCurrentIndex(index)
              }}
              className={`hero-slider-dot h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Show slide ${index + 1}: ${movie.title}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(HeroSlider)
