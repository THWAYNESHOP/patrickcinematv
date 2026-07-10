import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'
import { useTVDetection } from '../../hooks/useTVDetection'
import type { MovieSummary } from '../../api/tmdb'

interface HeroSliderProps {
  movies: MovieSummary[]
}

const AUTOPLAY_INTERVAL = 6000

export default function HeroSlider({ movies }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)
  const { triggerHaptic } = useHapticFeedback()
  const isTV = useTVDetection()

  const currentMovie = useMemo(
    () => movies[currentIndex] || movies[0],
    [currentIndex, movies],
  )

  useEffect(() => {
    const element = heroRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.25 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isTV || !isVisible || movies.length <= 1) return

    const id = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, AUTOPLAY_INTERVAL)

    return () => window.clearInterval(id)
  }, [isTV, isVisible, movies.length])

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const changeSlide = useCallback(
    (direction: 'next' | 'prev') => {
      triggerHaptic('light')
      setCurrentIndex((prev) =>
        direction === 'next'
          ? (prev + 1) % movies.length
          : (prev - 1 + movies.length) % movies.length,
      )
    },
    [triggerHaptic, movies.length],
  )

  const backgroundImage = useMemo(() => {
    if (!currentMovie) return undefined
    return currentMovie.backdrop?.replace('w500', 'w1280') || currentMovie.backdrop
  }, [currentMovie])

  if (!currentMovie) {
    return null
  }

  return (
    <div ref={heroRef} className="relative h-[54vh] min-h-[470px] overflow-hidden sm:h-[56vh] md:h-[60vh] lg:h-[70vh]">
      <img
        src={backgroundImage}
        alt={currentMovie.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/25" />

      <div className="absolute inset-0 flex items-end pb-10 sm:pb-12 md:pb-16 lg:pb-20">
        <div className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-[22rem] sm:max-w-xl md:max-w-2xl">
            <h1 className="mb-2 text-4xl font-bold leading-[1.02] tracking-normal text-white sm:text-5xl md:mb-3 md:text-5xl lg:mb-4 lg:text-7xl">
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
                className="flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-xs font-semibold text-black transition-all duration-300 hover:bg-gray-200 md:gap-2 md:px-6 md:py-2.5 md:text-sm lg:gap-2 lg:px-8 lg:py-3 lg:text-base"
              >
                <Play className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" fill="black" />
                Play
              </Link>
              <Link
                to={`/movie/${currentMovie.id}`}
                className="flex items-center gap-1.5 rounded-md bg-gray-500/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-gray-500/90 md:gap-2 md:px-6 md:py-2.5 md:text-sm lg:gap-2 lg:px-8 lg:py-3 lg:text-base"
              >
                <Info className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => changeSlide('prev')}
        className="group absolute left-3 top-[34%] z-10 flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 p-2 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-black/60 sm:left-4 sm:top-1/2 md:p-3"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white transition-colors" />
      </button>
      <button
        onClick={() => changeSlide('next')}
        className="group absolute right-3 top-[34%] z-10 flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 p-2 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-black/60 sm:right-4 sm:top-1/2 md:p-3"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-white transition-colors" />
      </button>
    </div>
  )
}
