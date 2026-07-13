import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useStore } from '../store/useStore'
import { ArrowLeft, Bell, User, Laptop, Moon, Sun } from 'lucide-react'

const qualityOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const

const SETTINGS_TOUR_KEY = 'nexastream-settings-tour'

export default function Settings() {
  const { theme, setThemeMode, resolvedTheme } = useTheme()
  const { playbackPreferences, setPlaybackPreferences, notificationPreferences, setNotificationPreferences, user } = useStore()

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_TOUR_KEY, 'seen')
  }, [])

  const themeLabel = useMemo(() => {
    if (theme === 'dark') return 'Dark'
    if (theme === 'light') return 'Light'
    return 'System'
  }, [theme])

  const handlePreferenceChange = (key: keyof typeof playbackPreferences, value: boolean | 'auto' | 'low' | 'medium' | 'high') => {
    setPlaybackPreferences({
      ...playbackPreferences,
      [key]: value,
    })
  }

  const handleNotificationChange = (key: keyof typeof notificationPreferences, value: boolean) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [key]: value,
    })
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="glass rounded-2xl p-8 neon-border">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-2">Settings</p>
              <h1 className="text-3xl font-bold text-white">Preferences</h1>
              <p className="text-gray-400 mt-2 max-w-2xl">
                Manage your theme, playback behavior, and notification preferences in one place.
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to profile
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="glass rounded-2xl p-8 neon-border">
            <div className="flex items-center gap-3 mb-6">
              <Laptop className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-white">Appearance</h2>
                <p className="text-gray-400 text-sm">Choose your theme preference and see the current mode.</p>
              </div>
            </div>

            <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-gray-300 uppercase tracking-[0.3em] mb-3">Theme mode</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
                  { id: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
                  { id: 'system', label: 'System', icon: <Laptop className="w-5 h-5" /> },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setThemeMode(option.id as 'dark' | 'light' | 'system')}
                    className={`rounded-2xl border p-4 text-sm font-semibold transition-all duration-200 flex flex-col items-center gap-2 ${
                      theme === option.id
                        ? 'border-primary bg-primary/10 text-white scale-105'
                        : 'border-white/10 text-gray-300 hover:border-white/20 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-400">Current applied mode: <span className="text-white">{themeLabel}</span> ({resolvedTheme})</p>
            </div>
          </div>

            <div className="mt-10 space-y-6">
              <div>
                <p className="text-xl font-semibold text-white mb-3">Playback preferences</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="rounded-3xl border border-white/10 bg-black/20 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">Autoplay</p>
                      <p className="text-gray-400 text-sm">Enable auto-play when content loads.</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('autoplay', !playbackPreferences.autoplay)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        playbackPreferences.autoplay ? 'bg-primary text-black' : 'bg-white/10 text-gray-200'
                      }`}
                    >
                      {playbackPreferences.autoplay ? 'On' : 'Off'}
                    </button>
                  </label>

                  <label className="rounded-3xl border border-white/10 bg-black/20 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">Low data mode</p>
                      <p className="text-gray-400 text-sm">Reduce data usage during playback.</p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('lowDataMode', !playbackPreferences.lowDataMode)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        playbackPreferences.lowDataMode ? 'bg-primary text-black' : 'bg-white/10 text-gray-200'
                      }`}
                    >
                      {playbackPreferences.lowDataMode ? 'On' : 'Off'}
                    </button>
                  </label>
                </div>

                <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-white font-semibold mb-3">Default quality</p>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {qualityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handlePreferenceChange('defaultQuality', option.value)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          playbackPreferences.defaultQuality === option.value
                            ? 'border-primary bg-primary/10 text-white'
                            : 'border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="glass rounded-2xl p-6 neon-border">
              <div className="flex items-center gap-3 mb-5">
                <Bell className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Notifications</h2>
                  <p className="text-gray-400 text-sm">Control what alerts you receive.</p>
                </div>
              </div>

              <div className="space-y-4">
                {(
                  Object.entries(notificationPreferences) as Array<[
                    keyof typeof notificationPreferences,
                    boolean
                  ]>
                ).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/20 p-4"
                  >
                    <div>
                      <p className="text-white font-semibold">{key === 'sports' ? 'Sports Alerts' : key === 'newReleases' ? 'New releases' : 'Favorites updates'}</p>
                      <p className="text-gray-400 text-sm">{key === 'sports' ? 'Live sports updates and scores.' : key === 'newReleases' ? 'Notify when new movies and shows arrive.' : 'Get alerts for your favorite shows.'}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(key, !value)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        value ? 'bg-primary text-black' : 'bg-white/10 text-gray-200'
                      }`}
                    >
                      {value ? 'On' : 'Off'}
                    </button>
                  </label>
                ))}
              </div>
            </section>

            <section className="glass rounded-2xl p-6 neon-border">
              <div className="flex items-center gap-3 mb-5">
                <User className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Account</h2>
                  <p className="text-gray-400 text-sm">Information about your signed-in user.</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p><span className="font-semibold text-white">Signed in:</span> {user ? user.email : 'No user detected'}</p>
                <p><span className="font-semibold text-white">Account type:</span> {user ? 'Authenticated user' : 'Guest'}</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
