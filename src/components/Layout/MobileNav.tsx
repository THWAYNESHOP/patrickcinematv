import { memo, useCallback } from 'react'
import { Home, Film, Monitor, Trophy, Radio } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useHapticFeedback } from '../../hooks/useHapticFeedback'

const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Movies', path: '/movies', icon: Film },
  { name: 'TV', path: '/tv', icon: Monitor },
  { name: 'Sports', path: '/sports', icon: Trophy },
  { name: 'Live', path: '/live-tv', icon: Radio },
]

function MobileNav() {
  const location = useLocation()
  const { triggerHaptic } = useHapticFeedback()

  const handleClick = useCallback(() => triggerHaptic('light'), [triggerHaptic])

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 bg-deepBlack/95 backdrop-blur-xl border-t border-white/5 z-40 md:hidden pb-safe-bottom"
    >
      <div className="flex items-stretch justify-around px-1 py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
          const linkClasses = `flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 min-h-[52px] transition-all duration-200 active:scale-95 tv-focusable tv-touch-target ${
            isActive ? 'text-white bg-primary/10' : 'text-gray-500 hover:text-gray-300'
          }`
          const iconClasses = `w-5 h-5 ${isActive ? 'text-primary' : ''}`
          const labelClasses = `text-[11px] leading-none ${isActive ? 'font-semibold' : ''}`

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleClick}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className={linkClasses}
            >
              <Icon className={iconClasses} />
              <span className={labelClasses}>{item.name}</span>
            </Link>
          )
        })}
        {/* removed Sign In from bottom nav — moved to top-right menu */}
      </div>
    </nav>
  )
}

export default memo(MobileNav)
