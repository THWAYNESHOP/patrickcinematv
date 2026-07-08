import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useKeyboardHandler } from './useKeyboardHandler'

describe('useKeyboardHandler', () => {
  const originalUserAgent = navigator.userAgent

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    })
  })

  it('does not register keyboard listeners on TV browsers', () => {
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 7.0) AppleWebKit/537.36',
      configurable: true,
    })

    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useKeyboardHandler())

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeEventListenerSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function))

    unmount()
  })
})
