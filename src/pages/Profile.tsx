import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import { User, Mail, Clock, Heart, Play, LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { getAuth } from 'firebase/auth'

export default function Profile() {
  const { user } = useAuth()
  const { myList, watchHistory, watchProgress } = useStore()
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'progress'>('favorites')

  const handleSignOut = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
    } catch (error) {
      console.error('Sign out failed:', error)
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
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
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {watchHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No watch history yet
              </div>
            ) : (
              watchHistory.map((item) => (
                <div key={item.id} className="glass rounded-xl p-4 flex gap-4">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400">
                      Watched {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            {Object.keys(watchProgress).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No content in progress
              </div>
            ) : (
              Object.entries(watchProgress).map(([id, progress]) => {
                const item = myList.find(i => i.id === id) || { id, title: 'Unknown', poster: '' }
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
    </div>
  )
}
