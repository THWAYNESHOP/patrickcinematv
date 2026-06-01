import { Trophy, Flag, Circle, Flame } from 'lucide-react'

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
    { id: 'ufc', name: 'UFC', icon: Flame },
    { id: 'tennis', name: 'Tennis', icon: Circle },
    { id: 'motorsports', name: 'F1', icon: Flag },
    { id: 'cricket', name: 'Cricket', icon: Trophy },
  ]

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {sports.map((sport) => {
        const Icon = sport.icon
        const isActive = selectedSport === sport.id
        
        return (
          <button
            key={sport.id}
            onClick={() => onSportChange(sport.id)}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm transition-all duration-150 active:scale-95 ${
              isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'glass hover:bg-white/15 text-gray-300 hover:text-gray-100'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{sport.name}</span>
            <span className="sm:hidden">{sport.name.split(' ')[0]}</span>
          </button>
        )
      })}
    </div>
  )
}
