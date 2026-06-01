import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock, Zap } from 'lucide-react'
import { sportsApi, Match } from '../../api/sports'

interface LiveMatchesProps {
  limit?: number
  sport?: string
  variant?: 'live' | 'upcoming'
}

// Loading Skeleton Component
function MatchSkeleton() {
  return (
    <div className="glass rounded-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-24 bg-gray-800/50" />
      
      {/* Content Skeleton */}
      <div className="p-3 space-y-2">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 bg-gray-800/50 rounded w-16" />
          <div className="h-6 bg-gray-800/50 rounded-full w-20" />
        </div>
        
        {/* Score Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 bg-gray-800/50 rounded w-20" />
          <div className="h-5 bg-gray-800/50 rounded w-12" />
          <div className="h-3 bg-gray-800/50 rounded w-20" />
        </div>
        
        {/* Button */}
        <div className="h-8 bg-gray-800/50 rounded-lg mt-2" />
      </div>
    </div>
  )
}

export default function LiveMatches({ limit, sport, variant = 'live' }: LiveMatchesProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)
        const data = variant === 'upcoming'
          ? await sportsApi.getUpcomingMatches()
          : await sportsApi.getLiveMatches()
        let filteredMatches = data
        
        if (sport && sport !== 'all') {
          filteredMatches = data.filter((m) => m.sport === sport)
        }
        if (limit) {
          filteredMatches = filteredMatches.slice(0, limit)
        }

        setMatches(filteredMatches)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching matches:', error)
        setLoading(false)
      }
    }

    fetchMatches()
  }, [limit, sport, variant])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <MatchSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="glass rounded-lg p-6 text-gray-400 text-center">
        No {variant === 'upcoming' ? 'upcoming' : 'live'} matches found for this sport right now.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {matches.map((match) => {
        // Use the first available source if available
        const firstSource = match.sources && match.sources.length > 0 ? match.sources[0] : null
        const isLive = variant === 'live'
        
        return (
          <Link
            key={match.id}
            to={firstSource ? `/sports/${firstSource.source}/${firstSource.id}` : `/sports/${match.id}`}
            className="group glass rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            {/* Image Container with Thumbnail */}
            {match.poster && (
              <div className="relative w-full h-24 overflow-hidden bg-gray-900">
                <img
                  src={match.poster}
                  alt={match.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Status Badge with Pulsing Indicator */}
                <div className="absolute top-1 right-1 z-10">
                  <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold backdrop-blur-sm ${
                    isLive
                      ? 'bg-primary/90 text-white'
                      : 'bg-blue-500/80 text-blue-50'
                  }`}>
                    {isLive ? (
                      <>
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span>LIVE</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-2.5 h-2.5" />
                        <span>UPCOMING</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Overlay on Hover - Play Indicator for Live */}
                {isLive && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                    <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="white" />
                  </div>
                )}
              </div>
            )}

            {/* Content Container */}
            <div className="p-3">
              {/* League */}
              <p className="text-xs text-gray-400 mb-2 truncate font-medium">{match.league}</p>
              
              {/* Teams vs Score */}
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{match.homeTeam}</p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <p className="text-sm font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                    {match.score}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate text-right">{match.awayTeam}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{match.time}</span>
              </div>

              {/* CTA Button */}
              <button className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary py-2 rounded-lg transition-colors duration-150 font-semibold text-xs">
                <Play className="w-3.5 h-3.5 flex-shrink-0" />
                {isLive ? 'Watch' : 'Details'}
              </button>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
