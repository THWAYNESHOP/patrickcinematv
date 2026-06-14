import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react'
import { CardSkeleton } from '../Skeleton'

interface ContentCarouselProps {
  title: string
  items: any[]
  type: 'movie' | 'tv' | 'anime'
  showProgress?: boolean
  loading?: boolean
}

export default function ContentCarousel({ title, items, type, showProgress = false, loading = false }: ContentCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      const newScrollLeft =
        direction === 'left'
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0)
      setCanScrollRight(
        scrollRef.current.scrollLeft <
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth
      )
    }
  }

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold mb-8 text-white tracking-tight">{title}</h2>
      <div className="relative group">
        {loading ? (
          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 border border-white/10 hover:border-white/20"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Carousel */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            >
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={`/${(item.type || type) === 'tv' ? 'tv' : (item.type || type) === 'anime' ? 'anime' : 'movie'}/${item.id}`}
                  className="flex-shrink-0 w-44 md:w-52 group/card"
                >
                  <div className="bg-darkSurface rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card-hover hover:shadow-glow border border-white/5 hover:border-white/10">
                    <div className="relative aspect-[2/3]">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Play className="w-14 h-14 text-primary" fill="white" />
                      </div>
                      {showProgress && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                          <div className="h-full bg-primary" style={{ width: '45%' }} />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-base text-white truncate leading-tight">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                          <span className="text-sm text-gray-400 font-medium">{item.rating}</span>
                        </div>
                        {item.year && <span className="text-sm text-gray-500">•</span>}
                        {item.year && <span className="text-sm text-gray-500 font-medium">{item.year}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 border border-white/10 hover:border-white/20"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
