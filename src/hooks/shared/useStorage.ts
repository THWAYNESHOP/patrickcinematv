/**
 * Shared storage utilities
 * Consolidated storage operations for localStorage and sessionStorage
 */

import { useState, useCallback } from 'react'

export type StorageType = 'localStorage' | 'sessionStorage'

interface StorageOptions<T> {
  key: string
  initialValue: T
  storage?: StorageType
  serialize?: (value: T) => string
  deserialize?: (value: string) => T
}

export function useStorage<T>({
  key,
  initialValue,
  storage = 'localStorage',
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}: StorageOptions<T>) {
  const storageAPI = window[storage]
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storageAPI.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.error(`Error reading ${storage} key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      storageAPI.setItem(key, serialize(valueToStore))
    } catch (error) {
      console.error(`Error setting ${storage} key "${key}":`, error)
    }
  }, [key, storedValue, storageAPI, serialize])

  const removeValue = useCallback(() => {
    try {
      storageAPI.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`Error removing ${storage} key "${key}":`, error)
    }
  }, [key, initialValue, storageAPI])

  return [storedValue, setValue, removeValue] as const
}

// Re-export useLocalStorage for backward compatibility
export function useLocalStorage<T>(key: string, initialValue: T) {
  return useStorage({ key, initialValue, storage: 'localStorage' })
}

// Export useSessionStorage for sessionStorage support
export function useSessionStorage<T>(key: string, initialValue: T) {
  return useStorage({ key, initialValue, storage: 'sessionStorage' })
}
