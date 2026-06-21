import { User } from 'lucide-react'
import { CastMember } from '../../api/tmdb'

interface CastRailProps {
  cast: CastMember[]
}

export default function CastRail({ cast }: CastRailProps) {
  if (!cast.length) return null

  return (
    <section className="mb-10 md:mb-12">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-5 text-white tracking-tight">Top Cast</h2>
      <div className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {cast.map((actor, index) => (
          <div
            key={actor.id || actor.name || index}
            className="flex-shrink-0 w-24 sm:w-28 text-center"
          >
            <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-white/10 mb-2 bg-darkElevated">
              {actor.profile ? (
                <img
                  src={actor.profile}
                  alt={actor.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <p className="font-medium text-xs sm:text-sm text-white leading-tight truncate">{actor.name}</p>
            {actor.character && (
              <p className="text-[11px] text-gray-500 leading-tight truncate mt-0.5">{actor.character}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
