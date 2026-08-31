import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, Bell, BellOff, Film, Tv, Star, ChevronRight } from 'lucide-react'
import { tmdbApi } from '../api/tmdb'
import type { MovieSummary } from '../api/tmdb'
import { useToast } from '../hooks/useToast'
import { useStore } from '../store/useStore'

interface UpcomingRelease extends MovieSummary {
  releaseDate: string
  type: 'movie' | 'tv'
}

interface Reminder {
  id: string
  mediaId: number
  title: string
  releaseDate: string
  type: 'movie' | 'tv'
  reminderDate: string
}

export default function ReleaseCalendar() {
  const [upcomingReleases, setUpcomingReleases] = useState<UpcomingRelease[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const toast = useToast()
  const { user } = useStore()
  
  // Get reminders from localStorage
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('nexastream-release-reminders')
    return saved ? JSON.parse(saved) : []
  })

  const fetchUpcomingReleases = useCallback(async () => {
    setLoading(true)
    try {
      const [upcomingMovies, upcomingTV] = await Promise.all([
        tmdbApi.discoverMovies({
          'release_date.gte': `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`,
          'release_date.lte': `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-31`,
          sort_by: 'release_date.asc'
        }),
        tmdbApi.discoverTV({
          'first_air_date.gte': `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`,
          'first_air_date.lte': `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-31`,
          sort_by: 'first_air_date.asc'
        })
      ])

      const releases: UpcomingRelease[] = [
        ...upcomingMovies.map(movie => ({
          ...movie,
          releaseDate: movie.year ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-15` : 'TBA',
          type: 'movie' as const
        })),
        ...upcomingTV.map(show => ({
          ...show,
          releaseDate: show.year ? `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-15` : 'TBA',
          type: 'tv' as const
        }))
      ].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate))

      setUpcomingReleases(releases)
    } catch (error) {
      console.error('Failed to fetch upcoming releases:', error)
      toast.error('Failed to load upcoming releases. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear, toast])

  useEffect(() => {
    fetchUpcomingReleases()
  }, [fetchUpcomingReleases])

  const setReminder = useCallback((release: UpcomingRelease) => {
    if (!user) {
      toast.error('Please sign in to set reminders')
      return
    }

    const existingReminder = reminders.find(r => r.mediaId === Number(release.id))
    
    if (existingReminder) {
      // Remove reminder
      const updated = reminders.filter(r => r.mediaId !== Number(release.id))
      setReminders(updated)
      localStorage.setItem('nexastream-release-reminders', JSON.stringify(updated))
      toast.success('Reminder removed')
    } else {
      // Add reminder (1 day before release)
      const reminder: Reminder = {
        id: `${release.id}-${release.type}`,
        mediaId: Number(release.id),
        title: release.title,
        releaseDate: release.releaseDate,
        type: release.type,
        reminderDate: new Date(new Date(release.releaseDate).getTime() - 24 * 60 * 60 * 1000).toISOString()
      }
      const updated = [...reminders, reminder]
      setReminders(updated)
      localStorage.setItem('nexastream-release-reminders', JSON.stringify(updated))
      toast.success('Reminder set! You will be notified 1 day before release.')
    }
  }, [reminders, user, toast])

  const hasReminder = useCallback((mediaId: number) => {
    return reminders.some(r => r.mediaId === mediaId)
  }, [reminders])

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = [selectedYear, selectedYear + 1, selectedYear + 2]

  const formatDate = (dateString: string) => {
    if (dateString === 'TBA') return 'TBA'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const groupedReleases = upcomingReleases.reduce((acc, release) => {
    const date = release.releaseDate
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(release)
    return acc
  }, {} as Record<string, UpcomingRelease[]>)

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Release Calendar</h1>
          <p className="text-gray-400 text-lg">Stay updated with upcoming movies and TV shows</p>
        </div>

        {/* Month/Year Selector */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-6 h-6 text-primary" />
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index} className="bg-darkSurface">
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                >
                  {years.map(year => (
                    <option key={year} value={year} className="bg-darkSurface">
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {upcomingReleases.length} releases this month
            </div>
          </div>
        </div>

        {/* Releases List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : upcomingReleases.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No upcoming releases found for this month</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedReleases).map(([date, releases]) => (
              <div key={date} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold text-white">{formatDate(date)}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {releases.map((release) => (
                    <motion.div
                      key={`${release.id}-${release.type}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group"
                    >
                      <Link
                        to={`/${release.type === 'tv' ? 'tv' : 'movie'}/${release.id}`}
                        className="block"
                      >
                        <div className="relative aspect-[2/3]">
                          <img
                            src={release.poster}
                            alt={release.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
                              {release.type === 'movie' ? (
                                <Film className="w-3 h-3 text-white" />
                              ) : (
                                <Tv className="w-3 h-3 text-white" />
                              )}
                              <span className="text-xs text-white capitalize">{release.type}</span>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <ChevronRight className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-white text-sm truncate mb-2">{release.title}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/20 border border-accent/30">
                              <Star className="w-3 h-3 text-accent fill-accent" />
                              <span className="text-xs text-accent font-bold">{release.rating}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setReminder(release)
                              }}
                              className={`p-2 rounded-full transition-all duration-300 ${
                                hasReminder(Number(release.id))
                                  ? 'bg-primary text-white'
                                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
                              }`}
                              title={hasReminder(Number(release.id)) ? 'Remove reminder' : 'Set reminder'}
                            >
                              {hasReminder(Number(release.id)) ? (
                                <Bell className="w-4 h-4" />
                              ) : (
                                <BellOff className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Your Reminders Section */}
        {reminders.length > 0 && (
          <div className="mt-12 glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-white">Your Reminders</h2>
            </div>
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/20 border border-primary/30">
                      {reminder.type === 'movie' ? (
                        <Film className="w-3 h-3 text-primary" />
                      ) : (
                        <Tv className="w-3 h-3 text-primary" />
                      )}
                      <span className="text-xs text-primary capitalize">{reminder.type}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{reminder.title}</h4>
                      <p className="text-sm text-gray-400">Release: {formatDate(reminder.releaseDate)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = reminders.filter(r => r.id !== reminder.id)
                      setReminders(updated)
                      localStorage.setItem('nexastream-release-reminders', JSON.stringify(updated))
                      toast.success('Reminder removed')
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
