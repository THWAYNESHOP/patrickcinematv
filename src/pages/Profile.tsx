import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import WatchHistoryManager from '../components/WatchHistoryManager'
import Avatar from '../components/Avatar'
import { User, Mail, Clock, Heart, Play, LogOut, Edit2, X, Check } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { getAuth } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'

// Default avatars for users to choose from
const defaultAvatars = [
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Bella',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Diana',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Emma',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Frank',
  'https://api.dicebear.com/8.x/avataaars/svg?seed=Grace',
]

export default function Profile() {
  const { user, updateUserProfile } = useAuth()
  const { myList, watchHistory, watchProgress } = useStore()
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'progress'>('favorites')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const toast = useToast()
  const SETTINGS_TOUR_KEY = 'nexastream-settings-tour'
  const [settingsTourSeen, setSettingsTourSeen] = useState(() => window.localStorage.getItem(SETTINGS_TOUR_KEY) === 'seen')

  useEffect(() => {
    const seen = window.localStorage.getItem(SETTINGS_TOUR_KEY) === 'seen'
    if (seen !== settingsTourSeen) {
      setSettingsTourSeen(seen)
    }
  }, [settingsTourSeen])

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
      setSelectedAvatar(user.photoURL || null)
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
    } catch (error) {
      console.error('Sign out failed:', error)
      toast.error('Unable to sign out. Please try again.')
    }
  }

  const handleOpenEditModal = () => {
    if (user) {
      setDisplayName(user.displayName || '')
      setSelectedAvatar(user.photoURL || null)
    }
    setIsEditModalOpen(true)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateUserProfile({
        displayName: displayName || undefined,
        photoURL: selectedAvatar || undefined,
      })
      toast.success('Profile updated successfully!')
      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Please sign in to view your profile</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="glass rounded-2xl p-8 mb-8 neon-border">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar src={user.photoURL} alt={user.displayName || 'User'} size="xl" />
              <button
                onClick={handleOpenEditModal}
                className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors tv-focusable"
              >
                <Edit2 className="w-5 h-5 text-black" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.displayName || 'User'}
              </h1>
              <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                to="/settings"
                onClick={() => {
                  window.localStorage.setItem(SETTINGS_TOUR_KEY, 'seen')
                  setSettingsTourSeen(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-white font-semibold transition-colors"
              >
                <User className="w-4 h-4" />
                Settings
                {!settingsTourSeen && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                    New
                  </span>
                )}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass rounded-xl p-6 text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{myList.length}</p>
            <p className="text-gray-400 text-sm">Favorites</p>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{watchHistory.length}</p>
            <p className="text-gray-400 text-sm">Watch History</p>
          </div>
          <div className="glass rounded-xl p-6 text-center">
            <Play className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{Object.keys(watchProgress).length}</p>
            <p className="text-gray-400 text-sm">In Progress</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-primary text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-primary text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            Watch History
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'progress'
                ? 'bg-primary text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            In Progress
          </button>
        </div>

        {/* Content */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {myList.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                No favorites yet
              </div>
            ) : (
              myList.map((item) => (
                <div key={item.id} className="glass rounded-xl overflow-hidden">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && <WatchHistoryManager />}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            {Object.keys(watchProgress).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No content in progress
              </div>
            ) : (
              Object.entries(watchProgress).map(([id, progress]) => {
                const item = myList.find((i) => i.id === id) || { id, title: 'Unknown', poster: '' }
                return (
                  <div key={id} className="glass rounded-xl p-4">
                    <div className="flex gap-4 mb-3">
                      <img
                        src={item.poster}
                        alt={item.title}
                        className="w-20 h-28 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{item.title}</h3>
                        <p className="text-sm text-gray-400">{Math.round(progress * 100)}% complete</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/80"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-darkSurface border border-white/10 rounded-2xl p-6 md:p-8 max-w-lg w-[90%] shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Edit Profile</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors tv-focusable tv-touch-target"
                  aria-label="Close edit profile modal"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Choose Avatar
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {/* Default Avatar (none) */}
                    <button
                      onClick={() => setSelectedAvatar(null)}
                      className={`aspect-square rounded-xl border-2 transition-all ${
                        !selectedAvatar ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                    </button>

                    {/* Default Avatar Options */}
                    {defaultAvatars.map((avatar, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                          selectedAvatar === avatar ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img
                          src={avatar}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-semibold text-white mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/80 text-black font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-5 h-5" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
