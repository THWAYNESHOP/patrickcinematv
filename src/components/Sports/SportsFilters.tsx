import { Trophy, Zap, Flag, Circle } from 'lucide-react'

interface SportsFiltersProps {
  selectedSport: string
  onSportChange: (sport: string) => void
}

export default function SportsFilters({ selectedSport, onSportChange }: SportsFiltersProps) {
  const sports = [
    { id: 'all', name: 'All Sports', icon: Trophy },
    { id: 'football', name: 'Football', icon: Trophy },
    { id: 'afl', name: 'AFL', icon: Trophy },
    { id: 'rugby', name: 'Rugby', icon: Trophy },
    { id: 'basketball', name: 'NBA', icon: Circle },
    { id: 'ufc', name: 'UFC', icon: Zap },
    { id: 'tennis', name: 'Tennis', icon: Circle },
    { id: 'motorsports', name: 'Formula 1', icon: Flag },
    { id: 'cricket', name: 'Cricket', icon: Trophy },
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {sports.map((sport) => {
        const Icon = sport.icon
        return (
          <button
            key={sport.id}
            onClick={() => onSportChange(sport.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              selectedSport === sport.id
                ? 'bg-neonPink text-white neon-glow'
                : 'glass hover:bg-white/10 text-gray-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {sport.name}
          </button>
        )
      })}
    </div>
  )
}
