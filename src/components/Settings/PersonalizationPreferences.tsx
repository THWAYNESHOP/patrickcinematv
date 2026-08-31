import { useState, useEffect } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { useStore } from '../../store/useStore'

interface PersonalizationSettings {
  showRecommendedForYou: boolean
  showBecauseYouWatched: boolean
  showTrendingInGenres: boolean
  showContinueWatching: boolean
  showFavorites: boolean
  useWatchHistory: boolean
  useRatings: boolean
  includeNewReleases: boolean
}

const DEFAULT_SETTINGS: PersonalizationSettings = {
  showRecommendedForYou: true,
  showBecauseYouWatched: true,
  showTrendingInGenres: true,
  showContinueWatching: true,
  showFavorites: true,
  useWatchHistory: true,
  useRatings: true,
  includeNewReleases: true,
}

export default function PersonalizationPreferences() {
  const [settings, setSettings] = useState<PersonalizationSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const { clearWatchHistory } = useStore()

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nexastream-personalization-settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load personalization settings:', e)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('nexastream-personalization-settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS)
    localStorage.removeItem('nexastream-personalization-settings')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your watch history? This cannot be undone.')) {
      clearWatchHistory()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const toggleSetting = (key: keyof PersonalizationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Personalization Settings</h3>
        <p className="text-sm text-gray-400 mb-6">
          Control how NEXASTREAM personalizes your experience based on your viewing habits
        </p>
      </div>

      {/* Recommendation Settings */}
      <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.showRecommendedForYou}
              onChange={() => toggleSetting('showRecommendedForYou')}
              className="w-5 h-5 rounded border-white/20 bg-white/10"
            />
            <div className="flex-1">
              <p className="text-white font-medium group-hover:text-primary transition">Recommended For You</p>
              <p className="text-sm text-gray-400">Show personalized recommendations based on your activity</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.showBecauseYouWatched}
              onChange={() => toggleSetting('showBecauseYouWatched')}
              className="w-5 h-5 rounded border-white/20 bg-white/10"
            />
            <div className="flex-1">
              <p className="text-white font-medium group-hover:text-primary transition">Because You Watched</p>
              <p className="text-sm text-gray-400">See similar content based on recently watched items</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.showTrendingInGenres}
              onChange={() => toggleSetting('showTrendingInGenres')}
              className="w-5 h-5 rounded border-white/20 bg-white/10"
            />
            <div className="flex-1">
              <p className="text-white font-medium group-hover:text-primary transition">Trending in Your Genres</p>
              <p className="text-sm text-gray-400">Discover trending content in your favorite categories</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.showContinueWatching}
              onChange={() => toggleSetting('showContinueWatching')}
              className="w-5 h-5 rounded border-white/20 bg-white/10"
            />
            <div className="flex-1">
              <p className="text-white font-medium group-hover:text-primary transition">Continue Watching</p>
              <p className="text-sm text-gray-400">Show items you started but haven't finished</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={settings.showFavorites}
              onChange={() => toggleSetting('showFavorites')}
              className="w-5 h-5 rounded border-white/20 bg-white/10"
            />
            <div className="flex-1">
              <p className="text-white font-medium group-hover:text-primary transition">Your Favorites</p>
              <p className="text-sm text-gray-400">Display your saved watch list prominently</p>
            </div>
          </label>
        </div>
      </div>

      {/* Data Usage Settings */}
      <div className="space-y-4 bg-white/5 rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Data & Privacy</h4>
        
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.useWatchHistory}
            onChange={() => toggleSetting('useWatchHistory')}
            className="w-5 h-5 rounded border-white/20 bg-white/10"
          />
          <div className="flex-1">
            <p className="text-white font-medium group-hover:text-primary transition">Use Watch History</p>
            <p className="text-sm text-gray-400">Allow us to track and use your viewing history for recommendations</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.useRatings}
            onChange={() => toggleSetting('useRatings')}
            className="w-5 h-5 rounded border-white/20 bg-white/10"
          />
          <div className="flex-1">
            <p className="text-white font-medium group-hover:text-primary transition">Use Ratings</p>
            <p className="text-sm text-gray-400">Use your ratings to improve recommendation quality</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={settings.includeNewReleases}
            onChange={() => toggleSetting('includeNewReleases')}
            className="w-5 h-5 rounded border-white/20 bg-white/10"
          />
          <div className="flex-1">
            <p className="text-white font-medium group-hover:text-primary transition">Include New Releases</p>
            <p className="text-sm text-gray-400">Prioritize showing newly released content in recommendations</p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="space-y-3 bg-white/5 rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Data Management</h4>
        
        <button
          onClick={handleClearHistory}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition border border-red-500/30 text-sm font-medium"
        >
          Clear Watch History
        </button>

        <p className="text-xs text-gray-500 text-center">
          This will remove all your watch history and cannot be undone
        </p>
      </div>

      {/* Save Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primaryHover text-black font-semibold transition"
        >
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition border border-white/20"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Default
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          Preferences saved successfully
        </div>
      )}
    </div>
  )
}
