import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import SearchBar from '../Search/SearchBar'

interface NavbarProps {
  isScrolled: boolean
}

export default function Navbar({ isScrolled }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const location = useLocation()

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
          ? 'bg-deepBlack/95 backdrop-blur-xl border-b border-white/5 py-3'
          : 'bg-gradient-to-b from-deepBlack/95 via-deepBlack/80 to-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl font-extrabold text-white tracking-wider uppercase transition-all duration-200 group-hover:tracking-[0.15em]">
              <span className="text-primary">NEXA</span>STREAM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-all duration-200 relative ${
                  location.pathname === item.path
                    ? 'text-white after:content-[""] after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 bg-darkSurface/95 backdrop-blur-xl rounded-lg p-4 space-y-1 border border-white/5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-3 px-4 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-white font-medium'
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
