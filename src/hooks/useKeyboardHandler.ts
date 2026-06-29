import { useEffect, useCallback, useRef } from 'react'

type KeyboardHandler = (event: KeyboardEvent) => boolean | void

/**
 * Centralized keyboard event handler to prevent conflicts and improve performance
 * especially on TV devices where multiple listeners can cause hanging
 */
export function useKeyboardHandler() {
  const handlersRef = useRef<Map<string, KeyboardHandler>>(new Map())
  const isTVRef = useRef(false)

  // Detect TV once
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const tvPatterns = ['tv', 'smart-tv', 'tizen', 'webos', 'hbbtv', 'netcast']
    isTVRef.current = tvPatterns.some(pattern => userAgent.includes(pattern))
  }, [])

  const registerHandler = useCallback((key: string, handler: KeyboardHandler) => {
    handlersRef.current.set(key, handler)
    return () => {
      handlersRef.current.delete(key)
    }
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // On TV, throttle key presses to prevent spamming
    if (isTVRef.current) {
      const now = Date.now()
      const lastKeyTime = (handleKeyDown as any).lastKeyTime || 0
      if (now - lastKeyTime < 150) {
        return // Throttle on TV
      }
      (handleKeyDown as any).lastKeyTime = now
    }

    // Check registered handlers
    for (const [key, handler] of handlersRef.current) {
      if (e.key === key || e.key.toLowerCase() === key.toLowerCase()) {
        const shouldPreventDefault = handler(e)
        if (shouldPreventDefault !== false) {
          e.preventDefault()
        }
        return
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { registerHandler }
}
