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
    { name: 'IPTV', path: '/live-tv', icon: Radio },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-deepBlack/95 backdrop-blur-xl border-t border-white/5 z-40 md:hidden pb-safe-bottom">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => triggerHaptic('light')}
              className={`flex flex-col items-center space-y-1 transition-all duration-200 min-w-[60px] min-h-[60px] justify-center ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
