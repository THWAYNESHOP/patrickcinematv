import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useContinueWatching } from './useContinueWatching'

describe('useContinueWatching', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should initialize with empty continue watching list', () => {
    const { result } = renderHook(() => useContinueWatching())
    expect(result.current.continueWatching).toEqual([])
  })

  it('should add item to continue watching', () => {
    const { result } = renderHook(() => useContinueWatching())
    
    act(() => {
      result.current.updateProgress('123', 'Test Movie', 50, 120)
    })
    
    expect(result.current.continueWatching).toHaveLength(1)
    expect(result.current.continueWatching[0].id).toBe('123')
  })

  it('should update progress for existing item', () => {
    const { result } = renderHook(() => useContinueWatching())
    
    act(() => {
      result.current.updateProgress('123', 'Test Movie', 50, 120)
    })
    
    act(() => {
      result.current.updateProgress('123', 'Test Movie', 75, 120)
    })
    
    expect(result.current.continueWatching[0].progress).toBe(75)
  })

  it('should remove item from continue watching', () => {
    const { result } = renderHook(() => useContinueWatching())
    
    act(() => {
      result.current.updateProgress('123', 'Test Movie', 50, 120)
    })
    
    act(() => {
      result.current.removeFromContinueWatching('123')
    })
    
    expect(result.current.continueWatching).toHaveLength(0)
  })
})
