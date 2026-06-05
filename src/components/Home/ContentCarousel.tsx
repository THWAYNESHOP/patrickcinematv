import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react'

interface ContentCarouselProps {
  title: string
  items: any[]
  type: 'movie' | 'tv' | 'anime'
  showProgress?: boolean
}

export default function ContentCarousel({ title, items, type, showProgress = false }: ContentCarouselProps) {
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
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">{title}</h2>
      <div className="relative group">
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
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/${(item.type || type) === 'tv' ? 'tv' : (item.type || type) === 'anime' ? 'anime' : 'movie'}/${item.id}`}
              className="flex-shrink-0 w-40 md:w-48 group/card"
            >
              <div className="bg-darkSurface rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card-hover hover:shadow-glow border border-white/5 hover:border-white/10">
                <div className="relative aspect-[2/3]">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Play className="w-12 h-12 text-primary" />
                  </div>
                  {showProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                      <div className="h-full bg-primary" style={{ width: '45%' }} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-white truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-xs text-gray-400">{item.rating}</span>
                    </div>
                    {item.year && <span className="text-xs text-gray-500">{item.year}</span>}
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
      </div>
    </div>
  )
}
