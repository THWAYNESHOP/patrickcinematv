import { TrendingUp, Flame, Zap } from 'lucide-react'

interface TrendingBadgeProps {
  type?: 'trending' | 'hot' | 'new'
  position?: number
}

export default function TrendingBadge({ type = 'trending', position }: TrendingBadgeProps) {
  const badges = {
    trending: {
      icon: TrendingUp,
      color: 'bg-blue-500',
      label: 'Trending'
    },
    hot: {
      icon: Flame,
      color: 'bg-orange-500',
      label: 'Hot'
    },
    new: {
      icon: Zap,
      color: 'bg-green-500',
      label: 'New'
    }
  }

  const { icon: Icon, color, label } = badges[type]

  return (
    <div className={`absolute top-2 left-2 ${color} text-white px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-bold shadow-lg z-10`}>
      {position !== undefined && (
        <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px]">
          {position}
        </span>
      )}
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  )
}
