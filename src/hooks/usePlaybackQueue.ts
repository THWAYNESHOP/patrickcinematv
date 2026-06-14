import { useState, useCallback } from 'react'

interface QueueItem {
  id: string | number
  title: string
  src: string
  type: 'movie' | 'tv' | 'anime' | 'sports'
}

export function usePlaybackQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState<'off' | 'all' | 'one'>('off')

  const addToQueue = useCallback((item: QueueItem) => {
    setQueue(prev => [...prev, item])
  }, [])

  const removeFromQueue = useCallback((id: string | number) => {
    setQueue(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setCurrentIndex(-1)
  }, [])

  const playNext = useCallback(() => {
    if (queue.length === 0) return null
    
    let nextIndex: number
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else {
      nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0
    }
    
    setCurrentIndex(nextIndex)
    return queue[nextIndex]
  }, [queue, currentIndex, isShuffle])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return null
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1
    setCurrentIndex(prevIndex)
    return queue[prevIndex]
  }, [queue, currentIndex])

  const playItem = useCallback((id: string | number) => {
    const index = queue.findIndex(item => item.id === id)
    if (index !== -1) {
      setCurrentIndex(index)
      return queue[index]
    }
    return null
  }, [queue])

  const getCurrentItem = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < queue.length) {
      return queue[currentIndex]
    }
    return null
  }, [queue, currentIndex])

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev)
  }, [])

  const toggleRepeat = useCallback(() => {
    setIsRepeat(prev => {
      if (prev === 'off') return 'all'
      if (prev === 'all') return 'one'
      return 'off'
    })
  }, [])

  return {
    queue,
    currentIndex,
    isShuffle,
    isRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPrevious,
    playItem,
    getCurrentItem,
    toggleShuffle,
    toggleRepeat
  }
}
