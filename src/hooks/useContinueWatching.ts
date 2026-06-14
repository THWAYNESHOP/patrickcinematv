import { useState, useEffect } from 'react'

export interface ContinueWatchingItem {
  id: string
  title: string
  poster: string
  type: 'movie' | 'tv' | 'sports'
  progress: number // 0-100
  timestamp: number
  duration?: number
}

const CONTINUE_WATCHING_KEY = 'nexastream-continue-watching'

export function useContinueWatching() {
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([])

  useEffect(() => {
    loadContinueWatching()
  }, [])

  const loadContinueWatching = () => {
    try {
      const stored = localStorage.getItem(CONTINUE_WATCHING_KEY)
      if (stored) {
        const items = JSON.parse(stored)
        // Sort by timestamp (most recent first)
        items.sort((a: ContinueWatchingItem, b: ContinueWatchingItem) => b.timestamp - a.timestamp)
        setContinueWatching(items)
      }
    } catch (error) {
      console.error('Failed to load continue watching:', error)
    }
  }

  const updateProgress = (item: Omit<ContinueWatchingItem, 'timestamp'>) => {
    const existingIndex = continueWatching.findIndex(i => i.id === item.id)
    const newItem: ContinueWatchingItem = {
      ...item,
      timestamp: Date.now()
    }

    let updated: ContinueWatchingItem[]
    if (existingIndex >= 0) {
      updated = [...continueWatching]
      updated[existingIndex] = newItem
    } else {
      updated = [newItem, ...continueWatching]
    }

    // Keep only last 20 items
    updated = updated.slice(0, 20)
    
    setContinueWatching(updated)
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated))
  }

  const removeFromContinueWatching = (id: string) => {
    const updated = continueWatching.filter(item => item.id !== id)
    setContinueWatching(updated)
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(updated))
  }

  const clearContinueWatching = () => {
    setContinueWatching([])
    localStorage.removeItem(CONTINUE_WATCHING_KEY)
  }

  return {
    continueWatching,
    updateProgress,
    removeFromContinueWatching,
    clearContinueWatching
  }
}
