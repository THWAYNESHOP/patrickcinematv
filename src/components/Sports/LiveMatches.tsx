import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Radio, Clock } from 'lucide-react'
import { sportsApi, Match } from '../../api/sports'

interface LiveMatchesProps {
  limit?: number
  sport?: string
  variant?: 'live' | 'upcoming'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-lg p-4 skeleton h-32" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.length === 0 && (
        <div className="glass rounded-lg p-6 text-gray-400 md:col-span-2 lg:col-span-3">
          No {variant === 'upcoming' ? 'upcoming' : 'live'} matches found for this sport right now.
        </div>
      )}

      {matches.map((match) => {
        // Use the first available source if available
        const firstSource = match.sources && match.sources.length > 0 ? match.sources[0] : null
        
        return (
          <Link
            key={match.id}
            to={firstSource ? `/sports/${firstSource.source}/${firstSource.id}` : `/sports/${match.id}`}
            className="glass rounded-lg overflow-hidden hover:bg-white/10 transition-colors neon-border"
          >
            {match.poster && (
              <img
                src={match.poster}
                alt={match.title}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
            )}

            <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">{match.league}</span>
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  variant === 'upcoming'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-red-500/20 text-red-400 animate-pulse'
                }`}>
                  <Radio className="w-3 h-3" />
                  {variant === 'upcoming' ? 'UPCOMING' : 'LIVE'}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {match.time}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="text-center flex-1">
                <p className="font-semibold text-sm">{match.homeTeam}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-2xl font-bold neon-text">{match.score}</p>
              </div>
              <div className="text-center flex-1">
                <p className="font-semibold text-sm">{match.awayTeam}</p>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-neonPink/20 hover:bg-neonPink/30 text-neonPink py-2 rounded-lg transition-colors">
              <Play className="w-4 h-4" />
              {variant === 'upcoming' ? 'Match Details' : 'Watch Stream'}
            </button>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
