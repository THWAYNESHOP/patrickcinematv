import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { getOrderedKenyanSeriesItems } from '../data/kenyanSeries'

export default function KenyanSeries() {
  return (
    <div className="min-h-screen bg-deepBlack px-4 py-8 text-white sm:px-6 md:px-12 lg:px-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-white">
            Kenyan Series
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold sm:text-4xl">Kenyan Series</h1>
            <p className="max-w-3xl text-base text-gray-400 sm:text-lg">
              Browse the latest Kenyan series cards directly from this section.
            </p>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-3 sm:gap-4">
          {getOrderedKenyanSeriesItems().map((item) => (
            <Link
              key={item.id}
              to={`/kenyan-series/${item.id}`}
              className="group/card flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border border-white/5 bg-darkSurface shadow-lg shadow-black/20 transition duration-300 hover:scale-[1.02] hover:border-white/10 hover:shadow-card-hover sm:w-44 md:w-48 xl:w-52"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover/card:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                  <Play className="h-10 w-10 text-primary sm:h-12 sm:w-12" fill="white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                {item.tag && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-primary/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black">
                    {item.tag}
                  </span>
                )}
              </div>

              <div className="p-2.5 sm:p-3">
                <h2 className="truncate text-sm font-semibold text-white sm:text-base">{item.title}</h2>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex items-center gap-1 rounded-md border border-accent/30 bg-accent/20 px-2 py-0.5">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span className="text-[11px] font-bold text-accent">8.5</span>
                  </div>
                  {item.year && <span className="text-[11px] text-gray-500">•</span>}
                  {item.year && <span className="text-[11px] text-gray-500">{item.year}</span>}
                </div>
                <p className="mt-1 text-xs text-gray-400">Tap to open</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
