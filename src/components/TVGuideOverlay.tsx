import { X, Home, Film, Tv, Trophy, Radio, Zap, TrendingUp, Heart } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface TVGuideOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export default function TVGuideOverlay({ isOpen, onClose }: TVGuideOverlayProps) {
  const location = useLocation()

  const sections = [
    { name: 'Home', path: '/', icon: Home, number: 1 },
    { name: 'Movies', path: '/movies', icon: Film, number: 2 },
    { name: 'TV Series', path: '/tv', icon: Tv, number: 3 },
    { name: 'Sports', path: '/sports', icon: Trophy, number: 4 },
    { name: 'Live TV', path: '/live-tv', icon: Radio, number: 5 },
    { name: 'Anime', path: '/anime', icon: Zap, number: 6 },
    { name: 'Trending', path: '/trending', icon: TrendingUp, number: 7 },
    { name: 'My List', path: '/my-list', icon: Heart, number: 8 }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85"
          />

          {/* Guide Grid */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-darkSurface border border-white/10 rounded-2xl p-6 md:p-8 max-w-3xl w-[90%] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">TV Guide</h2>
                <p className="text-gray-400 text-sm md:text-base">Quick navigation for your remote</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors tv-focusable tv-touch-target"
                aria-label="Close TV Guide"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = location.pathname === section.path
                return (
                  <Link
                    key={section.path}
                    to={section.path}
                    onClick={onClose}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-200 border-2 tv-focusable tv-touch-target ${
                      isActive
                        ? 'bg-primary/20 border-primary text-primary shadow-lg'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-10 h-10 md:w-12 md:h-12 mb-3" />
                    <span className="text-sm md:text-base font-semibold mb-2">{section.name}</span>
                    <span className="text-xs md:text-sm opacity-60">{section.number}</span>
                  </Link>
                )
              })}
            </div>

            {/* Close Hint */}
            <p className="text-gray-500 text-xs md:text-sm text-center mt-8">
              Press <kbd className="px-2 py-0.5 bg-white/10 rounded text-white">Escape</kbd> or <kbd className="px-2 py-0.5 bg-white/10 rounded text-white">G</kbd> to close
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
