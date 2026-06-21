import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { MovieSummary } from '../../api/tmdb'

interface MediaRailProps {
  title: string
  items: MovieSummary[]
  type: 'movie' | 'tv'
}

export default function MediaRail({ title, items, type }: MediaRailProps) {
  if (!items.length) return null

  return (
    <section className="mb-10 md:mb-12">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-5 text-white tracking-tight">{title}</h2>
      <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
        {items.slice(0, 12).map((item) => (
          <Link
            key={item.id}
            to={`/${type}/${item.id}`}
            className="group flex-shrink-0 w-32 sm:w-36 md:w-44 snap-start"
          >
            <div className="relative rounded-xl overflow-hidden border border-white/5 group-hover:border-primary/40 transition-all duration-300 group-hover:-translate-y-1 shadow-lg group-hover:shadow-glow">
              <img
                src={item.poster}
                alt={item.title}
                loading="lazy"
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {item.rating && item.rating !== 'N/A' && (
                <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[11px] font-semibold text-white">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  {item.rating}
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
            </div>
            <div className="pt-2">
              <p className="font-medium text-sm text-white truncate group-hover:text-primary transition-colors">{item.title}</p>
              {item.year && <p className="text-gray-500 text-xs">{item.year}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
