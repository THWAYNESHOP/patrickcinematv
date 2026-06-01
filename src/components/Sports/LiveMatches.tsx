import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { sportsApi, Match } from '../../api/sports'

interface LiveMatchesProps {
  limit?: number
  sport?: string
  variant?: 'live' | 'upcoming'
}

// Flag emoji mapping for common teams/countries
const getTeamFlag = (teamName: string): string => {
  const name = teamName.toLowerCase()
  const flagMap: Record<string, string> = {
    'manchester united': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'liverpool': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'real madrid': '🇪🇸',
    'barcelona': '🇪🇸',
    'lakers': '🇺🇸',
    'warriors': '🇺🇸',
    'chelsea': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'arsenal': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'bayern': '🇩🇪',
    'psg': '🇫🇷',
    'juventus': '🇮🇹',
    'milan': '🇮🇹',
    'inter': '🇮🇹',
    'celtics': '🇺🇸',
    'heat': '🇺🇸',
    'nets': '🇺🇸',
    'bulls': '🇺🇸',
  }
  
  for (const [key, flag] of Object.entries(flagMap)) {
    if (name.includes(key)) return flag
  }
  return '⚽'
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { 
    y: -4,
    transition: { duration: 0.2 }
  }
}

const skeletonVariants = {
  initial: { opacity: 0.5 },
  animate: { opacity: 1 },
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 rounded-xl overflow-hidden"
          >
            <div className="h-20 bg-white/10 skeleton" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-white/10 rounded skeleton w-3/4" />
              <div className="flex justify-between">
                <div className="h-3 bg-white/10 rounded skeleton w-1/3" />
                <div className="h-3 bg-white/10 rounded skeleton w-1/4" />
              </div>
              <div className="h-8 bg-white/10 rounded-lg skeleton mt-2" />
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {matches.length === 0 && (
        <div className="col-span-full bg-white/5 rounded-xl p-6 text-gray-400 text-center">
          No {variant === 'upcoming' ? 'upcoming' : 'live'} matches found for this sport right now.
        </div>
      )}

      {matches.map((match, index) => {
        const firstSource = match.sources && match.sources.length > 0 ? match.sources[0] : null
        const homeFlag = getTeamFlag(match.homeTeam)
        const awayFlag = getTeamFlag(match.awayTeam)
        
        return (
          <motion.div
            key={match.id}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <Link
              to={firstSource ? `/sports/${firstSource.source}/${firstSource.id}` : `/sports/${match.id}`}
              className="block h-full"
            >
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-200 h-full flex flex-col">
                {/* Compact header with flags */}
                <div className="p-3 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      {match.league}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      variant === 'upcoming'
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}>
                      {variant === 'upcoming' ? 'UPCOMING' : 'LIVE'}
                    </span>
                  </div>
                  
                  {/* Team names with flags */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{homeFlag}</span>
                      <span className="text-xs font-semibold text-white truncate flex-1">
                        {match.homeTeam}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{awayFlag}</span>
                      <span className="text-xs font-semibold text-white truncate flex-1">
                        {match.awayTeam}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score/Time section */}
                <div className="px-3 pb-2">
                  <div className="flex items-center justify-center py-1.5 bg-white/5 rounded-lg">
                    {variant === 'live' ? (
                      <span className="text-sm font-bold text-white">{match.score}</span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{match.time}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <div className="p-3 pt-2 mt-auto">
                  <button className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-white/10 text-white text-xs font-medium py-2 rounded-lg transition-colors duration-200">
                    <Play className="w-3 h-3" fill="currentColor" />
                    {variant === 'upcoming' ? 'View Details' : 'Watch'}
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
