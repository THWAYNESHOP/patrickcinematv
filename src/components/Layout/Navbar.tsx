import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react'
import SearchBar from '../Search/SearchBar'
import AuthModal from '../Auth/AuthModal'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../hooks/useAuth'

interface NavbarProps {
  isScrolled: boolean
}

interface NavItem {
  name: string
  path: string
}

interface NavDropdownProps {
  label: string
  items: NavItem[]
  isActive: (path: string) => boolean
  onNavigate: () => void
}

function NavDropdown({ label, items, isActive, onNavigate }: NavDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const groupActive = items.some((item) => isActive(item.path))

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={ref}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1 text-sm font-semibold transition-all duration-300 relative py-2 px-1 tv-focusable tv-touch-target whitespace-nowrap min-h-[44px] ${
          groupActive
            ? 'text-white after:content-[""] after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 pt-2 z-50">
          <div className="min-w-[180px] rounded-xl border border-white/10 bg-darkSurface/95 backdrop-blur-xl shadow-2xl py-1.5">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  setOpen(false)
                  onNavigate()
                }}
                className={`block px-4 py-2.5 text-sm font-medium transition-colors tv-focusable tv-touch-target ${
                  isActive(item.path)
                    ? 'text-white bg-primary/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Navbar({ isScrolled }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()

  const browseItems: NavItem[] = [
    { name: 'Movies', path: '/movies' },
    { name: 'TV Series', path: '/tv' },
    { name: 'Anime', path: '/anime' },
  ]

  const liveItems: NavItem[] = [
    { name: 'Sports', path: '/sports' },
    { name: 'Livestreams', path: '/live-tv' },
  ]

  const mobileGroups = [
    { label: null, items: [{ name: 'Home', path: '/' }] },
    { label: 'Browse', items: browseItems },
    { label: 'Live', items: liveItems },
    {
      label: 'Discover',
      items: [
        { name: 'Trending', path: '/trending' },
        { name: 'My List', path: '/my-list' },
      ],
    },
  ]

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  const navLinkClass = (path: string) =>
    `text-sm font-semibold transition-all duration-300 relative py-2 px-1 tv-focusable tv-touch-target whitespace-nowrap ${
      isActive(path)
        ? 'text-white after:content-[""] after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
        : 'text-gray-400 hover:text-white hover:text-shadow-sm'
    }`

  useEffect(() => {
    const openSearch = () => setIsSearchOpen(true)
    window.addEventListener('nexastream:open-search', openSearch)
    return () => window.removeEventListener('nexastream:open-search', openSearch)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const userLabel = user?.displayName || user?.email?.split('@')[0] || 'Account'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-safe-top ${
        isScrolled
          ? 'bg-deepBlack/95 backdrop-blur-xl border-b border-white/5 py-3 shadow-lg'
          : 'bg-gradient-to-b from-deepBlack/95 via-deepBlack/80 to-transparent py-4 md:py-5'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between gap-4">
          {/* Left — logo + desktop nav */}
          <div className="flex items-center gap-6 lg:gap-10 min-w-0">
            <Link to="/" className="flex shrink-0 items-center group tv-focusable tv-touch-target">
              <span className="text-xl md:text-2xl font-extrabold text-white tracking-wider uppercase transition-all duration-300 group-hover:tracking-[0.12em]">
                <span className="text-primary">NEXA</span>STREAM
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className={navLinkClass('/')}>
                Home
              </Link>
              <NavDropdown
                label="Browse"
                items={browseItems}
                isActive={isActive}
                onNavigate={() => {}}
              />
              <NavDropdown
                label="Live"
                items={liveItems}
                isActive={isActive}
                onNavigate={() => {}}
              />
              <Link to="/trending" className={navLinkClass('/trending')}>
                Trending
              </Link>
              <Link to="/my-list" className={navLinkClass('/my-list')}>
                My List
              </Link>
            </div>
          </div>

          {/* Right — account + utilities */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="hidden md:flex p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white min-w-[44px] min-h-[44px] items-center justify-center tv-focusable tv-touch-target"
                  aria-label="Profile"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-4 pr-1.5 py-1">
                  <span className="text-sm text-gray-300 max-w-[120px] truncate" title={user.email || undefined}>
                    {userLabel}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-white text-sm font-semibold transition-all duration-300 tv-focusable tv-touch-target"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}

            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white min-w-[44px] min-h-[44px] items-center justify-center tv-focusable tv-touch-target"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white min-w-[44px] min-h-[44px] items-center justify-center tv-focusable tv-touch-target"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 bg-darkSurface/95 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-2xl">
            {mobileGroups.map((group, groupIndex) => (
              <div
                key={group.label ?? 'home'}
                className={groupIndex > 0 ? 'mt-4 pt-4 border-t border-white/10' : ''}
              >
                {group.label && (
                  <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-3 px-3 rounded-lg transition-all duration-300 min-h-[44px] flex items-center tv-focusable tv-touch-target ${
                        isActive(item.path)
                          ? 'bg-primary/10 text-white font-semibold'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsSearchOpen(true)
                }}
                className="w-full flex items-center gap-3 py-3 px-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all min-h-[44px] tv-focusable tv-touch-target"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 py-3 px-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all min-h-[44px] tv-focusable tv-touch-target sm:hidden"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              {user ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    void handleSignOut()
                  }}
                  className="w-full flex items-center gap-3 py-3 px-3 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all min-h-[44px] tv-focusable tv-touch-target"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out ({userLabel})
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    setIsAuthOpen(true)
                  }}
                  className="w-full flex items-center gap-3 py-3 px-3 rounded-lg bg-primary/10 text-white font-semibold transition-all min-h-[44px] tv-focusable tv-touch-target"
                >
                  <User className="w-5 h-5" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </nav>
  )
}
