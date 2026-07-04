import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useNetworkStatus } from './useNetworkStatus'

describe('useNetworkStatus', () => {
  const originalNavigator = window.navigator

  beforeEach(() => {
    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: {
        ...originalNavigator,
        onLine: true,
      },
    })
  })

  it('defaults to online and not slow by default', () => {
    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current.isOnline).toBe(true)
    expect(result.current.isSlowConnection).toBe(false)
    expect(result.current.effectiveConnectionType).toBe('unknown')
  })

  it('updates when the browser goes offline', () => {
    const { result } = renderHook(() => useNetworkStatus())

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    })

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.isOnline).toBe(false)
  })

  it('detects slow connection types', () => {
    const connection = {
      effectiveType: 'slow-2g',
      saveData: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window.navigator, 'connection', {
      configurable: true,
      value: connection,
    })

    const { result } = renderHook(() => useNetworkStatus())

    expect(result.current.isSlowConnection).toBe(true)
    expect(result.current.effectiveConnectionType).toBe('slow-2g')
  })
})
