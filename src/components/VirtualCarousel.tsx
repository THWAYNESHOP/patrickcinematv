import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'

interface VirtualCarouselProps {
  items: any[]
  type: 'movie' | 'tv' | 'anime'
  showProgress?: boolean
}

export default function VirtualCarousel({ items, type, showProgress }: VirtualCarouselProps) {
  const itemWidth = 220 // w-44
  const gap = 20 // gap-5
  const totalItemWidth = itemWidth + gap

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-5" style={{ width: `${items.length * totalItemWidth}px` }}>
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/${type === 'tv' ? 'tv' : type === 'anime' ? 'anime' : 'movie'}/${item.id}`}
            className="flex-shrink-0 group/card"
            style={{ width: itemWidth }}
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
                  <Play className="w-12 h-12 text-primary" />
                </div>
                {showProgress && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                    <div className="h-full bg-primary" style={{ width: '45%' }} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-base text-white truncate">{item.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="text-sm text-gray-400">{item.rating}</span>
                  </div>
                  {item.year && <span className="text-sm text-gray-500">•</span>}
                  {item.year && <span className="text-sm text-gray-500">{item.year}</span>}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
