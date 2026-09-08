import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X, Sun, Moon, Laptop, User, LogOut, ChevronDown } from 'lucide-react'
import SearchBar from '../Search/SearchBar'
import { useTheme } from '../../hooks/useTheme'
import { useStore } from '../../store/useStore'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../Avatar'

const AuthModal = lazy(() => import('../Auth/AuthModal'))

interface NavbarProps {
  isScrolled: boolean
  isPlayerPage?: boolean
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

export default function Navbar({ isScrolled, isPlayerPage = false }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [settingsTourSeen, setSettingsTourSeen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user: firebaseUser } = useAuth()
  const user = useStore((state) => state.user)
  const isAuthOpen = useStore((state) => state.isAuthModalOpen)
  const setIsAuthOpen = useStore((state) => state.setIsAuthModalOpen)

  useEffect(() => {
    const SETTINGS_TOUR_KEY = 'nexastream-settings-tour'
    setSettingsTourSeen(window.localStorage.getItem(SETTINGS_TOUR_KEY) === 'seen')
  }, [location.pathname])

  const browseItems: NavItem[] = [
    { name: 'Movies', path: '/movies' },
    { name: 'TV Series', path: '/tv' },
    { name: 'Kenyan Series', path: '/kenyan-series' },
    { name: 'Anime', path: '/anime' },
  ]

  const liveItems: NavItem[] = [
    { name: 'Sports', path: '/sports' },
    { name: 'Livestreams', path: '/live-tv' },
  ]

  const discoverItems: NavItem[] = [
    { name: 'Mood Recommendations', path: '/mood-recommendations' },
    { name: 'Collections', path: '/collections' },
    { name: 'Franchises', path: '/franchises' },
    { name: 'Release Calendar', path: '/release-calendar' },
    { name: 'Trending', path: '/trending' },
  ]

  const mobileGroups = [
    { label: null, items: [{ name: 'Home', path: '/' }] },
    { label: 'Browse', items: browseItems },
    { label: 'Live', items: liveItems },
    { label: 'Discover', items: discoverItems },
    {
      label: 'Library',
      items: [
        { name: 'My List', path: '/my-list' },
        { name: 'Queue', path: '/queue' },
        { name: 'Watch History', path: '/watch-history' },
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
      const [{ app }, { getAuth, signOut }] = await Promise.all([
        import('../../firebase'),
        import('firebase/auth'),
      ])

      if (app) {
        await signOut(getAuth(app))
      }

      useStore.getState().setUser(null)
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const userLabel = user?.name || user?.email?.split('@')[0] || 'Account'
  const themeIcon = theme === 'dark' ? <Sun className="w-5 h-5 transition-all duration-300" /> : theme === 'light' ? <Moon className="w-5 h-5 transition-all duration-300" /> : <Laptop className="w-5 h-5 transition-all duration-300" />
  const showSettingsBadge = !settingsTourSeen

  const navClass = isPlayerPage
    ? 'fixed top-0 left-0 right-0 z-50 transition-all duration-500 pt-safe-top bg-deepBlack/95 backdrop-blur-2xl border-b border-white/5 py-2'
    : 'fixed top-0 left-0 right-0 z-50 transition-colors duration-500 pt-safe-top flex justify-center w-full pointer-events-none py-4'

  const navContainerClass = isPlayerPage
    ? `container mx-auto px-3 sm:px-6 md:px-12 lg:px-16`
    : `container mx-auto px-4 sm:px-6 md:px-12 lg:px-16 pointer-events-auto transition-colors duration-500 max-w-[95%] lg:max-w-[90%] rounded-2xl py-3 ${
        isScrolled
          ? 'bg-deepBlack/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50'
          : 'bg-transparent border border-transparent'
      }`

  return (
    <>
      <nav className={navClass}>
      <a
        href="#main-content"
        className="absolute left-4 -top-10 focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black px-3 py-2 rounded transition-all"
      >
        Skip to content
      </a>
      <div className={navContainerClass}>
        <div className="flex items-center justify-between gap-4">
          {/* Left: logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex shrink-0 items-center group tv-focusable tv-touch-target">
              <span className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase transition-all duration-300 group-hover:text-primary">
                <span className="text-primary">NEXA</span>STREAM
              </span>
            </Link>
          </div>

          {/* Right: desktop nav + account */}
          <div className="flex items-center justify-end gap-6 lg:gap-8 w-full">
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
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
              <NavDropdown
                label="Discover"
                items={discoverItems}
                isActive={isActive}
                onNavigate={() => {}}
              />
              <Link to="/my-list" className={navLinkClass('/my-list')}>
                My List
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="hidden md:flex rounded-full hover:bg-white/10 transition-all duration-300 tv-focusable tv-touch-target"
                    aria-label="Profile"
                    title="Profile"
                  >
                    <Avatar src={firebaseUser?.photoURL} alt={firebaseUser?.displayName || 'User'} size="md" />
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold transition-all duration-300 hover:bg-primaryHover hover:scale-105 shadow-lg shadow-primary/20 tv-focusable tv-touch-target"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              )}

              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white min-w-[44px] min-h-[44px] items-center justify-center tv-focusable tv-touch-target"
                aria-label="Open search"
                data-testid="desktop-search-toggle"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center tv-focusable tv-touch-target"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Mobile Profile Toggle */}
              {user ? (
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="sm:hidden rounded-full hover:bg-white/10 transition-all duration-300 tv-focusable tv-touch-target"
                  aria-label="Profile"
                  title="Profile"
                >
                  <Avatar src={firebaseUser?.photoURL} alt={firebaseUser?.displayName || 'User'} size="sm" />
                </Link>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="sm:hidden p-2.5 rounded-full hover:bg-white/10 transition-all duration-300 text-gray-300 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center tv-focusable tv-touch-target"
                  aria-label="Sign in"
                  title="Sign In"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed top-20 left-4 right-4 max-h-[calc(100dvh-7rem)] overflow-y-auto bg-darkSurface/95 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-2xl z-[60]">
          {mobileGroups.map((group, groupIndex) => (
            <div
              key={group.label ?? 'home'}
              className={groupIndex > 0 ? 'mt-4 pt-4 border-t border-white/10' : ''}
            >
              {group.label && (
                <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block py-3 px-3 rounded-xl transition-all duration-300 min-h-[44px] flex items-center tv-focusable tv-touch-target ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-white font-black italic'
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
            <Link
              to="/settings"
              onClick={() => setIsMenuOpen(false)}
              className={`block w-full py-3 px-3 rounded-xl transition-all duration-300 min-h-[44px] tv-focusable tv-touch-target ${
                isActive('/settings')
                  ? 'bg-primary/10 text-white font-black italic'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="inline-flex items-center justify-between w-full gap-3">
                <span>Settings</span>
                {showSettingsBadge && (
                  <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    New
                  </span>
                )}
              </span>
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false)
                setIsSearchOpen(true)
              }}
              className="w-full flex items-center gap-3 py-3 px-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all min-h-[44px] tv-focusable tv-touch-target"
              data-testid="mobile-search-toggle"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 py-3 px-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all min-h-[44px] tv-focusable tv-touch-target sm:hidden"
            >
              {themeIcon}
              {theme === 'dark' ? 'Light mode' : theme === 'light' ? 'System mode' : 'Dark mode'}
            </button>
            {user ? (
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  void handleSignOut()
                }}
                className="w-full flex items-center gap-3 py-3 px-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all min-h-[44px] tv-focusable tv-touch-target"
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
                className="w-full flex items-center gap-3 py-3 px-3 rounded-xl bg-primary/10 text-white font-black italic transition-all min-h-[44px] tv-focusable tv-touch-target"
              >
                <User className="w-5 h-5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      </nav>
      {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
      {isAuthOpen && (
        <Suspense fallback={null}>
          <AuthModal onClose={() => setIsAuthOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
