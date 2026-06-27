import { useEffect, useCallback, useRef } from 'react'

interface FocusableElement extends HTMLElement {
  dataset: {
    focusGroup?: string
  }
}

export function useSpatialNavigation() {
  const lastKeyTimeRef = useRef(0)
  const KEY_THROTTLE_MS = 100 // Throttle key presses to prevent spamming

  const getFocusableElements = useCallback((): FocusableElement[] => {
    return Array.from(
      document.querySelectorAll<FocusableElement>(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null)
  }, [])

  const findNextFocus = useCallback(
    (current: FocusableElement, direction: 'up' | 'down' | 'left' | 'right'): FocusableElement | null => {
      const currentRect = current.getBoundingClientRect()
      const elements = getFocusableElements()
      let bestCandidate: FocusableElement | null = null
      let bestDistance = Infinity

      for (const element of elements) {
        if (element === current) continue

        const rect = element.getBoundingClientRect()
        let isValid = false
        let distance = 0

        switch (direction) {
          case 'up':
            isValid = rect.bottom <= currentRect.top
            if (isValid) {
              const horizontalOverlap = Math.max(0, Math.min(currentRect.right, rect.right) - Math.max(currentRect.left, rect.left))
              distance = currentRect.top - rect.bottom + (horizontalOverlap === 0 ? 1000 : 0)
            }
            break
          case 'down':
            isValid = rect.top >= currentRect.bottom
            if (isValid) {
              const horizontalOverlap = Math.max(0, Math.min(currentRect.right, rect.right) - Math.max(currentRect.left, rect.left))
              distance = rect.top - currentRect.bottom + (horizontalOverlap === 0 ? 1000 : 0)
            }
            break
          case 'left':
            isValid = rect.right <= currentRect.left
            if (isValid) {
              const verticalOverlap = Math.max(0, Math.min(currentRect.bottom, rect.bottom) - Math.max(currentRect.top, rect.top))
              distance = currentRect.left - rect.right + (verticalOverlap === 0 ? 1000 : 0)
            }
            break
          case 'right':
            isValid = rect.left >= currentRect.right
            if (isValid) {
              const verticalOverlap = Math.max(0, Math.min(currentRect.bottom, rect.bottom) - Math.max(currentRect.top, rect.top))
              distance = rect.left - currentRect.right + (verticalOverlap === 0 ? 1000 : 0)
            }
            break
        }

        if (isValid && distance < bestDistance) {
          bestDistance = distance
          bestCandidate = element
        }
      }

      return bestCandidate
    },
    [getFocusableElements]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const now = Date.now()
      if (now - lastKeyTimeRef.current < KEY_THROTTLE_MS) {
        return // Ignore rapid key presses
      }
      lastKeyTimeRef.current = now

      const current = document.activeElement as FocusableElement
      if (!current) return

      let direction: 'up' | 'down' | 'left' | 'right' | null = null

      switch (e.key) {
        case 'ArrowUp':
          direction = 'up'
          break
        case 'ArrowDown':
          direction = 'down'
          break
        case 'ArrowLeft':
          direction = 'left'
          break
        case 'ArrowRight':
          direction = 'right'
          break
      }

      if (direction) {
        e.preventDefault()
        const next = findNextFocus(current, direction)
        if (next) {
          next.focus()
        }
      }
    },
    [findNextFocus]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
