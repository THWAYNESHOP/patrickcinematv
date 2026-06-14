import { useRef, useEffect, useState } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipeGestures({ onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeGestureOptions) {
  const [startX, setStartX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let currentStartX = 0

    const handleTouchStart = (e: TouchEvent) => {
      currentStartX = e.touches[0].clientX
      setStartX(currentStartX)
      setIsDragging(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const currentX = e.touches[0].clientX
      const diff = currentX - currentStartX
      
      // Add visual feedback
      container.style.transform = `translateX(${diff}px)`
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return
      const currentX = e.changedTouches[0].clientX
      const diff = currentX - startX

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (diff < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      // Reset transform
      container.style.transform = 'translateX(0)'
      setIsDragging(false)
    }

    const handleMouseDown = (e: MouseEvent) => {
      currentStartX = e.clientX
      setStartX(currentStartX)
      setIsDragging(true)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const currentX = e.clientX
      const diff = currentX - currentStartX
      
      container.style.transform = `translateX(${diff}px)`
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return
      const currentX = e.clientX
      const diff = currentX - startX

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && onSwipeRight) {
          onSwipeRight()
        } else if (diff < 0 && onSwipeLeft) {
          onSwipeLeft()
        }
      }

      container.style.transform = 'translateX(0)'
      setIsDragging(false)
    }

    // Touch events
    container.addEventListener('touchstart', handleTouchStart)
    container.addEventListener('touchmove', handleTouchMove)
    container.addEventListener('touchend', handleTouchEnd)

    // Mouse events
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseUp)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseUp)
    }
  }, [isDragging, startX, onSwipeLeft, onSwipeRight, threshold])

  return containerRef
}
