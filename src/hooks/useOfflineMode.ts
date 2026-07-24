import { useState, useEffect } from 'react'

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineQueue, setOfflineQueue] = useState<(() => void)[]>([])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Process offline queue when coming back online
      offlineQueue.forEach(action => action())
      setOfflineQueue([])
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [offlineQueue])

  const queueAction = (action: () => void) => {
    if (isOnline) {
      action()
    } else {
      setOfflineQueue(prev => [...prev, action])
    }
  }

  return {
    isOnline,
    queueAction,
    offlineQueueLength: offlineQueue.length
  }
}
