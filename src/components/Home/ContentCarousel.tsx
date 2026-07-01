import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play, Star, Plus, Check } from 'lucide-react'
import { CardSkeleton } from '../Skeleton'
import type { MovieSummary } from '../../api/tmdb'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'
import { useMyList } from '../../hooks/useMyList'

interface ContentCarouselProps {
  title: string
  items: MovieSummary[]
  type: 'movie' | 'tv' | 'anime'
  showProgress?: boolean
  loading?: boolean
}

export default function ContentCarousel({ title, items, type, showProgress = false, loading = false }: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const { triggerHaptic } = useHapticFeedback()
  const { addToMyList, removeFromMyList, isInMyList } = useMyList()

  const scroll = useCallback((direction: 'left' | 'right') => {
    triggerHaptic('light')
    if (scrollRef.current) {
      const scrollAmount = 300
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }, [triggerHaptic])

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0)
      setCanScrollRight(
        scrollRef.current.scrollLeft <
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth
      )
    }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const minSwipeDistance = 50
    
    if (distance > minSwipeDistance) {
      scroll('right')
    } else if (distance < -minSwipeDistance) {
      scroll('left')
    }
  }, [touchStart, touchEnd, scroll])

  useEffect(() => {
    if (!loading) {
      handleScroll()
    }
  }, [handleScroll, items.length, loading])

  const carouselItems = useMemo(() => {
    return items.map((item: MovieSummary) => {
      const itemId = String(item.id)
      const inMyList = isInMyList(itemId)
      const itemType = item.type || type

      const handleMyList = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (inMyList) {
          removeFromMyList(itemId)
          return
        }

        addToMyList({
          id: itemId,
          title: item.title,
          poster: item.poster,
          rating: item.rating,
          year: item.year,
          type: itemType,
        })
      }

      return (
        <div key={item.id} className="flex-shrink-0 w-36 sm:w-44 md:w-48 xl:w-52 group/card">
          <Link
            to={`/${itemType === 'tv' ? 'tv' : itemType === 'anime' ? 'anime' : 'movie'}/${item.id}`}
            className="block"
          >
            <div className="bg-darkSurface rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card-hover hover:shadow-glow border border-white/5 hover:border-white/10">
              <div className="relative aspect-[2/3]">
                <img
                  src={item.poster}
                  srcSet={`${item.poster}?w=300 300w, ${item.poster}?w=500 500w`}
                  sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 192px"
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="w-10 h-10 sm:w-14 sm:h-14 text-primary" fill="white" />
                </div>
                {showProgress && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                    <div className="h-full bg-primary" style={{ width: '45%' }} />
                  </div>
                )}
                {/* Add to List Button */}
                <button
                  onClick={handleMyList}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-primary rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-300 z-10"
                >
                  {inMyList ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
              <div className="p-2 md:p-3">
                <h3 className="font-semibold text-sm md:text-base text-white truncate leading-tight">{item.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/20 border border-accent/30">
                    <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-accent fill-accent" />
                    <span className="text-xs md:text-sm text-accent font-bold">{item.rating}</span>
                  </div>
                  {item.year && <span className="text-xs md:text-sm text-gray-500">•</span>}
                  {item.year && <span className="text-xs md:text-sm text-gray-500 font-medium">{item.year}</span>}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )
    })
  }, [items, type, showProgress, addToMyList, removeFromMyList, isInMyList])

  return (
    <div className="mb-12 md:mb-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white tracking-tight">{title}</h2>
      <div className="relative group">
        {loading ? (
          <div className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4">
            {Array(6).fill(null).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p>No content available</p>
          </div>
        ) : (
          <>
            {/* Left Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 -translate-x-2 md:-translate-x-2 md:group-hover:translate-x-0 border border-white/10 hover:border-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            )}

            {/* Carousel */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            >
              {carouselItems}
            </div>

            {/* Right Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-x-2 md:translate-x-2 md:group-hover:translate-x-0 border border-white/10 hover:border-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
