/**
 * Shared timing utilities
 * Consolidated debounce and throttle patterns
 */

import { useState, useEffect, useCallback } from 'react'

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useThrottle<T>(value: T, limit: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const [lastRun, setLastRun] = useState(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun >= limit) {
        setThrottledValue(value)
        setLastRun(Date.now())
      }
    }, limit - (Date.now() - lastRun))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit, lastRun])

  return throttledValue
}

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useState<ReturnType<typeof setTimeout> | null>(null)[0]

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
      const newTimeout = setTimeout(() => {
        callback(...args)
      }, delay)
      timeoutRef = newTimeout
    },
    [callback, delay, timeoutRef]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
    }
  }, [timeoutRef])

  return debouncedCallback
}

export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  limit: number = 500
): T {
  const lastRun = useState(Date.now())[0]
  const timeoutRef = useState<ReturnType<typeof setTimeout> | null>(null)[0]

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRun >= limit) {
        callback(...args)
        lastRun = now
      } else if (!timeoutRef) {
        const newTimeout = setTimeout(() => {
          callback(...args)
          lastRun = Date.now()
        }, limit - (now - lastRun))
        timeoutRef = newTimeout
      }
    },
    [callback, limit, lastRun, timeoutRef]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef)
      }
    }
  }, [timeoutRef])

  return throttledCallback
}
