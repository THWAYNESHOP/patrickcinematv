import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    // Ensure tests run with a stable media preference (dark by default)
    window.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
    }) as unknown as MediaQueryList
  })

  it('should initialize with dark theme by default', () => {
    const { result } = renderHook(() => useTheme())
    
    expect(result.current.theme).toBe('dark')
  })

  it('should toggle theme between dark and light', () => {
    const { result } = renderHook(() => useTheme())
    
    expect(result.current.theme).toBe('dark')
    
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')
  })

  it('should set theme mode explicitly', () => {
    const { result } = renderHook(() => useTheme())
    
    act(() => {
      result.current.setThemeMode('light')
    })
    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.setThemeMode('dark')
    })
    expect(result.current.theme).toBe('dark')
  })
})
