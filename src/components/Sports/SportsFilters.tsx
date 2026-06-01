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
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedSport === sport.id
                ? 'bg-white text-black'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {sport.name}
          </button>
        )
      })}
    </div>
  )
}
