import { useState, useEffect } from 'react'

export interface WatchHistoryItem {
  id: string
  title: string
  poster: string
  type: 'movie' | 'tv' | 'sports'
  timestamp: number
  duration?: number
}

const WATCH_HISTORY_KEY = 'nexastream-watch-history'

export function useWatchHistory() {
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([])

  useEffect(() => {
    loadWatchHistory()
  }, [])

  const loadWatchHistory = () => {
    try {
      const stored = localStorage.getItem(WATCH_HISTORY_KEY)
      if (stored) {
        const items = JSON.parse(stored)
        // Sort by timestamp (most recent first)
        items.sort((a: WatchHistoryItem, b: WatchHistoryItem) => b.timestamp - a.timestamp)
        setWatchHistory(items)
      }
    } catch (error) {
      console.error('Failed to load watch history:', error)
    }
  }

  const addToWatchHistory = (item: Omit<WatchHistoryItem, 'timestamp'>) => {
    const existingIndex = watchHistory.findIndex(i => i.id === item.id)
    const newItem: WatchHistoryItem = {
      ...item,
      timestamp: Date.now()
    }

    let updated: WatchHistoryItem[]
    if (existingIndex >= 0) {
      // Move to top if already exists
      updated = [newItem, ...watchHistory.filter(i => i.id !== item.id)]
    } else {
      updated = [newItem, ...watchHistory]
    }

    // Keep only last 50 items
    updated = updated.slice(0, 50)
    
    setWatchHistory(updated)
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(updated))
  }

  const removeFromWatchHistory = (id: string) => {
    const updated = watchHistory.filter(item => item.id !== id)
    setWatchHistory(updated)
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(updated))
  }

  const clearWatchHistory = () => {
    setWatchHistory([])
    localStorage.removeItem(WATCH_HISTORY_KEY)
  }

  const clearOldHistory = (daysToKeep: number = 30) => {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000)
    const updated = watchHistory.filter(item => item.timestamp > cutoffTime)
    setWatchHistory(updated)
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(updated))
  }

  return {
    watchHistory,
    addToWatchHistory,
    removeFromWatchHistory,
    clearWatchHistory,
    clearOldHistory
  }
}
