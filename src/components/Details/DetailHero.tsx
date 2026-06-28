import { ReactNode, useEffect, useRef } from 'react'
import { Star } from 'lucide-react'

export interface HeroMeta {
  icon?: ReactNode
  label: string
  highlight?: boolean
}

interface DetailHeroProps {
  backdrop: string
  poster: string
  title: string
  matchPercent?: number
  meta: HeroMeta[]
  genres: string[]
  overview: string
  trailer: { key: string; embedUrl: string } | null
  showTrailer: boolean
  children: ReactNode
}

export default function DetailHero({
  backdrop,
  poster,
  title,
  matchPercent = 98,
  meta,
  genres,
  overview,
  trailer,
  showTrailer,
  children,
}: DetailHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return
    const observer = new IntersectionObserver(() => {}, { threshold: 0.5 })
    observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [trailer])

  return (
    <div
      ref={heroRef}
      className="relative flex items-end min-h-[80vh] md:min-h-[85vh] bg-cover bg-center overflow-hidden"
      style={{ 
        backgroundImage: `url(${backdrop})`,
        imageRendering: '-webkit-optimize-contrast',
      } as React.CSSProperties}
    >
      {/* Base scrim */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${showTrailer ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/70 to-deepBlack/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-deepBlack/80 via-transparent to-transparent" />
      </div>

      {/* Trailer */}
      {trailer && showTrailer && (
        <div className="absolute inset-0 transition-opacity duration-1000 opacity-100">
          <style>{`.trailer-container iframe { pointer-events: none; }`}</style>
          <div className="trailer-container relative w-full h-full">
            <iframe
              src={trailer.embedUrl}
              title={`${title} Trailer`}
              className="w-full h-full object-cover scale-110"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-deepBlack via-deepBlack/40 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-deepBlack/70 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      <div className="relative z-10 w-full p-4 pb-8 sm:p-8 md:p-16">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 md:gap-10 items-start">
            <img
              src={poster}
              alt={title}
              className="hidden sm:block w-36 md:w-56 lg:w-64 rounded-2xl shadow-2xl ring-1 ring-white/15 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-3 md:mb-5 text-white tracking-tight text-shadow-lg leading-[1.05]">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 md:gap-2.5 mb-4 md:mb-5">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs md:text-sm font-bold">
                  {matchPercent}% Match
                </span>
                {meta.map((m, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full glass text-xs md:text-sm font-medium text-gray-100"
                  >
                    {m.icon}
                    {m.label}
                  </span>
                ))}
                <span className="px-2 py-1 rounded-md border border-white/20 text-[10px] md:text-xs font-semibold text-gray-300">
                  HD
                </span>
              </div>

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 rounded-full border border-white/15 text-xs md:text-sm text-gray-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-5 md:mb-7 max-w-2xl line-clamp-3 md:line-clamp-4 text-shadow-sm">
                {overview}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 md:gap-3">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MetaStar() {
  return <Star className="w-3.5 h-3.5 text-accent fill-accent" />
}
