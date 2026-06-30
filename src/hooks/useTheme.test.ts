import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTheme } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with dark theme by default', () => {
    const { result } = renderHook(() => useTheme())
    
    expect(result.current.theme).toBe('dark')
  })

  it('should toggle theme between dark and light', () => {
    const { result } = renderHook(() => useTheme())
    
    expect(result.current.theme).toBe('dark')
    
    result.current.toggleTheme()
    expect(result.current.theme).toBe('light')
    
    result.current.toggleTheme()
    expect(result.current.theme).toBe('dark')
  })

  it('should set theme mode explicitly', () => {
    const { result } = renderHook(() => useTheme())
    
    result.current.setThemeMode('light')
    expect(result.current.theme).toBe('light')
    
    result.current.setThemeMode('dark')
    expect(result.current.theme).toBe('dark')
  })
})
