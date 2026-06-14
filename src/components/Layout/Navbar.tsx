import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, Sun, Moon } from 'lucide-react'
import SearchBar from '../Search/SearchBar'
import { useTheme } from '../../hooks/useTheme'

interface NavbarProps {
  isScrolled: boolean
}

export default function Navbar({ isScrolled }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'TV Series', path: '/tv' },
    { name: 'Sports', path: '/sports' },
    { name: 'IPTV Player', path: '/live-tv' },
    { name: 'Anime', path: '/anime' },
    { name: 'Trending', path: '/trending' },
    { name: 'My List', path: '/my-list' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-deepBlack/95 backdrop-blur-xl border-b border-white/5 py-3 shadow-lg'
          : 'bg-gradient-to-b from-deepBlack/95 via-deepBlack/80 to-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-wider uppercase transition-all duration-300 group-hover:tracking-[0.15em] group-hover:scale-105">
              <span className="text-primary">NEXA</span>STREAM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold transition-all duration-300 relative py-2 ${
                  location.pathname === item.path
                    ? 'text-white after:content-[""] after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
                    : 'text-gray-400 hover:text-white hover:text-shadow-sm'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white hover:scale-110"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white hover:scale-110"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 bg-darkSurface/95 backdrop-blur-xl rounded-xl p-5 space-y-1 border border-white/10 shadow-2xl">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-3.5 px-5 rounded-xl transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-white font-semibold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}

      </div>
      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
    </nav>
  )
}
