import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface WatchHistoryItem {
  id: string
  item_id: string
  title: string
  poster: string
  type: 'movie' | 'tv' | 'anime' | 'sports'
  timestamp: number
}

export interface WatchProgressItem {
  id: string
  item_id: string
  progress: number
  updated_at: string
}

export function useUserWatchHistory() {
  const { user } = useAuth()
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([])
  const [watchProgress, setWatchProgress] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Fetch user's watch history and progress
  useEffect(() => {
    if (!user || !isSupabaseConfigured || !supabase) {
      setWatchHistory([])
      setWatchProgress({})
      setLoading(false)
      return
    }

    const fetchUserData = async () => {
      try {
        setLoading(true)

        const client = supabase;
        if (!client) return;

        // Fetch watch history
        const { data: historyData, error: historyError } = await client
          .from('watch_history')
          .select('*')
          .eq('user_id', user.uid)
          .order('timestamp', { ascending: false })
          .limit(50)

        if (historyError) throw historyError
        setWatchHistory(historyData || [])

        // Fetch watch progress
        const { data: progressData, error: progressError } = await client
          .from('watch_progress')
          .select('*')
          .eq('user_id', user.uid)

        if (progressError) throw progressError

        // Convert progress data to a record for easy lookup
        const progressMap: Record<string, number> = {}
        progressData?.forEach((item) => {
          progressMap[item.item_id] = item.progress
        })
        setWatchProgress(progressMap)
      } catch (error) {
        console.error('Error fetching user watch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  // Add item to watch history
  const addToHistory = async (item: Omit<WatchHistoryItem, 'id' | 'user_id' | 'timestamp'>) => {
    if (!user || !isSupabaseConfigured || !supabase) return

    try {
      const { error } = await supabase.from('watch_history').upsert({
        user_id: user.uid,
        item_id: item.item_id,
        title: item.title,
        poster: item.poster,
        type: item.type,
        timestamp: Date.now(),
      })

      if (error) throw error

      // Update local state
      setWatchHistory((prev) => {
        const existing = prev.find((h) => h.item_id === item.item_id)
        if (existing) {
          return prev.map((h) =>
            h.item_id === item.item_id
              ? { ...h, timestamp: Date.now() }
              : h
          ).sort((a, b) => b.timestamp - a.timestamp)
        }
        return [
          {
            id: crypto.randomUUID(),
            user_id: user.uid,
            ...item,
            timestamp: Date.now(),
          },
          ...prev,
        ]
      })
    } catch (error) {
      console.error('Error adding to watch history:', error)
    }
  }

  // Update watch progress
  const updateProgress = async (itemId: string, progress: number) => {
    if (!user || !isSupabaseConfigured || !supabase) return

    try {
      const { error } = await supabase.from('watch_progress').upsert({
        user_id: user.uid,
        item_id: itemId,
        progress,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      // Update local state
      setWatchProgress((prev) => ({
        ...prev,
        [itemId]: progress,
      }))
    } catch (error) {
      console.error('Error updating watch progress:', error)
    }
  }

  // Remove from watch history
  const removeFromHistory = async (itemId: string) => {
    if (!user || !isSupabaseConfigured || !supabase) return

    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.uid)
        .eq('item_id', itemId)

      if (error) throw error

      setWatchHistory((prev) => prev.filter((h) => h.item_id !== itemId))
    } catch (error) {
      console.error('Error removing from watch history:', error)
    }
  }

  // Clear all watch history
  const clearHistory = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return

    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.uid)

      if (error) throw error

      setWatchHistory([])
    } catch (error) {
      console.error('Error clearing watch history:', error)
    }
  }

  // Get continue watching items (items with progress > 0 and < 100)
  const continueWatching = watchHistory
    .filter((item) => {
      const progress = watchProgress[item.item_id]
      return progress && progress > 0 && progress < 100
    })
    .map((item) => ({
      ...item,
      progress: watchProgress[item.item_id] || 0,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)

  return {
    watchHistory,
    watchProgress,
    continueWatching,
    loading,
    addToHistory,
    updateProgress,
    removeFromHistory,
    clearHistory,
  }
}
