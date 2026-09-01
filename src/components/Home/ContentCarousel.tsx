import { memo, useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play, Star, Plus, Check } from 'lucide-react'
import { CardSkeleton } from '../Skeleton'
import type { MovieSummary } from '../../api/tmdb'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'
import { useMyList } from '../../hooks/useMyList'
import { useStore } from '../../store/useStore'

interface ContentCarouselProps {
  title: string
  items: MovieSummary[]
  type: 'movie' | 'tv' | 'anime' | 'sports'
  viewAllTo?: string
  showProgress?: boolean
  loading?: boolean
  carouselId?: string
  getCarouselPosition?: (carouselId: string) => number
  setCarouselPosition?: (carouselId: string, scrollLeft: number) => void
  getFocusedCardId?: (carouselId: string) => string | null
  setFocusedCardId?: (carouselId: string, cardId: string) => void
  onPrefetch?: (item: MovieSummary) => void
  performanceMode?: boolean
}

interface CarouselCardProps {
  item: MovieSummary
  itemType: 'movie' | 'tv' | 'anime' | 'sports'
  showProgress: boolean
  onToggleMyList: (item: MovieSummary, inMyList: boolean) => void
  onPrefetch?: (item: MovieSummary) => void
  carouselId?: string
  setFocusedCardId?: (carouselId: string, cardId: string) => void
  performanceMode?: boolean
}

const CarouselCard = function CarouselCard({
  item,
  itemType,
  showProgress,
  onToggleMyList,
  onPrefetch,
  carouselId,
  setFocusedCardId,
  performanceMode = false,
}: CarouselCardProps) {
  const inMyList = useStore((state) => state.isInMyList(String(item.id)))
  const user = useStore((state) => state.user)
  const setIsAuthModalOpen = useStore((state) => state.setIsAuthModalOpen)
  const setPendingCardNavigation = useStore((state) => state.setPendingCardNavigation)
  const navigatePath = `/${itemType === 'tv' ? 'tv' : itemType === 'anime' ? 'anime' : 'movie'}/${item.id}`

  const handleMyList = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      onToggleMyList(item, inMyList)
    },
    [item, inMyList, onToggleMyList],
  )

  const handleMouseEnter = useCallback(() => {
    if (performanceMode) return
    onPrefetch?.(item)
  }, [item, onPrefetch, performanceMode])

  const handleFocus = useCallback(() => {
    if (carouselId) {
      setFocusedCardId?.(carouselId, String(item.id))
    }
    if (performanceMode) return
    onPrefetch?.(item)
  }, [carouselId, item, onPrefetch, performanceMode, setFocusedCardId])

  const handleCardClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!user) {
        e.preventDefault?.()
        e.stopPropagation?.()
        setPendingCardNavigation({
          type: itemType,
          id: String(item.id),
        })
        setIsAuthModalOpen(true)
        return
      }

      if (carouselId) {
        setFocusedCardId?.(carouselId, String(item.id))
      }
    },
    [user, itemType, item.id, carouselId, setFocusedCardId, setPendingCardNavigation, setIsAuthModalOpen],
  )

  const cardContent = (
    <>
      <div className={`bg-darkSurface rounded-xl overflow-hidden border border-white/5 hover:border-white/10 ${
        performanceMode
          ? 'transition-none'
          : 'transition-all duration-300 hover:scale-105 hover:shadow-card-hover hover:shadow-glow'
      }`}>
        <div className="relative aspect-[2/3]">
          <img
            src={item.poster}
            srcSet={`${item.poster}?w=300 300w, ${item.poster}?w=500 500w`}
            sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 192px"
            alt={item.title}
            width={192}
            height={288}
            decoding="async"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-black/70 opacity-0 group-hover/card:opacity-100 flex items-center justify-center ${
            performanceMode ? 'transition-none' : 'transition-opacity duration-300'
          }`}>
            <Play className="w-10 h-10 sm:w-14 sm:h-14 text-primary" fill="white" />
          </div>
          {showProgress && typeof item.progress === 'number' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div className="h-full bg-primary" style={{ width: `${Math.min(item.progress, 100)}%` }} />
            </div>
          )}
          <button
            type="button"
            onClick={handleMyList}
            className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-primary rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-300 z-10"
            aria-label={inMyList ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`}
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
    </>
  )

  const commonProps = {
    onMouseEnter: handleMouseEnter,
    onFocus: handleFocus,
    onTouchStart: performanceMode ? undefined : handleMouseEnter,
  }

  if (!user) {
    return (
      <div key={item.id} className="flex-shrink-0 w-36 sm:w-44 md:w-48 xl:w-52 group/card" data-carousel-card-id={item.id}>
        <a
          href={navigatePath}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleCardClick(e)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleCardClick(e as unknown as React.MouseEvent<HTMLElement>)
            }
          }}
          className="block"
          {...commonProps}
        >
          {cardContent}
        </a>
      </div>
    )
  }

  return (
    <div key={item.id} className="flex-shrink-0 w-36 sm:w-44 md:w-48 xl:w-52 group/card" data-carousel-card-id={item.id}>
      <Link
        to={navigatePath}
        onClick={handleCardClick as React.MouseEventHandler<HTMLAnchorElement>}
        className="block"
        {...commonProps}
      >
        {cardContent}
      </Link>
    </div>
  )
}

const MemoizedCarouselCard = memo(CarouselCard)

export default function ContentCarousel({
  title,
  items,
  type,
  viewAllTo,
  showProgress = false,
  loading = false,
  carouselId,
  getCarouselPosition,
  setCarouselPosition,
  getFocusedCardId,
  setFocusedCardId,
  onPrefetch,
  performanceMode = false,
}: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollRAFRef = useRef<number | null>(null)
  const touchStartRef = useRef(0)
  const touchEndRef = useRef(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const { triggerHaptic } = useHapticFeedback()
  const { addToMyList, removeFromMyList } = useMyList()

  const toggleMyList = useCallback(
    (item: MovieSummary, inMyList: boolean) => {
      const itemId = String(item.id)
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
        type: item.type || type,
      })
    },
    [addToMyList, removeFromMyList, type],
  )

  const scroll = useCallback((direction: 'left' | 'right') => {
    triggerHaptic('light')
    if (scrollRef.current) {
      const scrollAmount = 300
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: performanceMode ? 'auto' : 'smooth' })
    }
  }, [performanceMode, triggerHaptic])

  useEffect(() => {
    if (!loading && carouselId && getCarouselPosition && scrollRef.current) {
      const saved = getCarouselPosition(carouselId)
      if (saved && scrollRef.current) {
        scrollRef.current.scrollLeft = saved
      }
    }

    if (!loading && carouselId && getFocusedCardId && scrollRef.current) {
      const focused = getFocusedCardId(carouselId)
      if (!focused) return
      const card = scrollRef.current.querySelector<HTMLElement>(`[data-carousel-card-id="${focused}"]`)
      if (card) {
        card.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' })
      }
    }
  }, [carouselId, getCarouselPosition, getFocusedCardId, loading])

  const handleScrollPosition = useCallback(() => {
    if (!carouselId || !setCarouselPosition || !scrollRef.current) return
    setCarouselPosition(carouselId, scrollRef.current.scrollLeft)
  }, [carouselId, setCarouselPosition])

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current
    if (!node) return

    const canLeft = node.scrollLeft > 0
    const canRight = node.scrollLeft < node.scrollWidth - node.clientWidth - 1

    setCanScrollLeft((prev) => (prev === canLeft ? prev : canLeft))
    setCanScrollRight((prev) => (prev === canRight ? prev : canRight))
  }, [])

  const handleScroll = useCallback(() => {
    if (scrollRAFRef.current !== null) return
    scrollRAFRef.current = window.requestAnimationFrame(() => {
      updateScrollState()
      handleScrollPosition()
      scrollRAFRef.current = null
    })
  }, [handleScrollPosition, updateScrollState])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = 0
    touchStartRef.current = e.targetTouches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const touchStart = touchStartRef.current
    const touchEnd = touchEndRef.current
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      scroll('right')
    } else if (distance < -minSwipeDistance) {
      scroll('left')
    }

    touchStartRef.current = 0
    touchEndRef.current = 0
  }, [scroll])

  useEffect(() => {
    if (!loading) {
      updateScrollState()
    }
  }, [updateScrollState, items.length, loading])

  useEffect(() => {
    return () => {
      if (scrollRAFRef.current !== null) {
        window.cancelAnimationFrame(scrollRAFRef.current)
      }
    }
  }, [])

  const carouselItems = useMemo(
    () =>
      items.map((item: MovieSummary, index: number) => (
        <MemoizedCarouselCard
          key={`${item.id}-${item.type}-${index}`}
          item={item}
          itemType={item.type || type}
          showProgress={showProgress}
          onToggleMyList={toggleMyList}
          carouselId={carouselId}
          setFocusedCardId={setFocusedCardId}
          onPrefetch={performanceMode ? undefined : onPrefetch}
          performanceMode={performanceMode}
        />
      )),
    [items, type, showProgress, toggleMyList, carouselId, onPrefetch, performanceMode, setFocusedCardId],
  )

  return (
    <div className="mb-12 md:mb-16">
      <div className="mb-4 md:mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-white tracking-tight md:text-2xl lg:text-3xl">{title}</h2>
          {!loading && items.length > 0 && (
            <p className="mt-1 text-xs font-medium text-gray-500 md:text-sm">{items.length} titles</p>
          )}
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="shrink-0 text-sm font-semibold text-gray-300 transition-colors hover:text-white tv-focusable tv-touch-target"
          >
            View All
          </Link>
        )}
      </div>
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
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 -translate-x-2 md:-translate-x-2 md:group-hover:translate-x-0 border border-white/10 hover:border-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Scroll carousel left"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            )}

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`flex gap-4 overflow-x-auto scrollbar-hide pb-4 pr-8 sm:gap-5 ${performanceMode ? '' : 'scroll-smooth'}`}
            >
              {carouselItems}
            </div>

            {canScrollRight && (
              <button
                type="button"
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-x-2 md:translate-x-2 md:group-hover:translate-x-0 border border-white/10 hover:border-white/20 min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
                aria-label="Scroll carousel right"
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
