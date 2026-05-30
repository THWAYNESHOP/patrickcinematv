import { Home, Film, Tv, Trophy, Radio } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function MobileNav() {
  const location = useLocation()

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'TV', path: '/tv', icon: Tv },
    { name: 'Sports', path: '/sports', icon: Trophy },
    { name: 'Live', path: '/live-tv', icon: Radio },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 z-50 md:hidden">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-neonPink' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
