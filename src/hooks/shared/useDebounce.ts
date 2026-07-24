/**
 * Shared timing utilities
 * Consolidated debounce and throttle patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react'

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      const newTimeout = setTimeout(() => {
        callback(...args)
      }, delay)
      timeoutRef.current = newTimeout
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  limit: number = 500
): T {
  const lastRun = useRef(Date.now())
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastRun.current >= limit) {
        callback(...args)
        lastRun.current = now
      } else if (!timeoutRef.current) {
        const newTimeout = setTimeout(() => {
          callback(...args)
          lastRun.current = Date.now()
        }, limit - (now - lastRun.current))
        timeoutRef.current = newTimeout
      }
    },
    [callback, limit]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}
