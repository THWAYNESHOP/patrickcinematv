import { Home, Film, Tv, Trophy, Radio } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'

export default function MobileNav() {
  const location = useLocation()
  const { triggerHaptic } = useHapticFeedback()

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'TV', path: '/tv', icon: Tv },
    { name: 'Sports', path: '/sports', icon: Trophy },
    { name: 'Live', path: '/live-tv', icon: Radio },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-deepBlack/95 backdrop-blur-xl border-t border-white/5 z-40 md:hidden pb-safe-bottom">
      <div className="flex items-stretch justify-around px-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => triggerHaptic('light')}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 min-h-[52px] transition-all duration-200 active:scale-95 ${
                isActive ? 'text-white bg-primary/10' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-[11px] leading-none ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
