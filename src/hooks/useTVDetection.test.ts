import { describe, expect, it } from 'vitest'
import { detectTVProfile } from './useTVDetection'

const baseInput = {
  userAgent: 'Mozilla/5.0',
  screenWidth: 1366,
  screenHeight: 768,
  maxTouchPoints: 0,
  hasTouchEvent: false,
  pointerFine: true,
  pointerCoarse: false,
  hoverNone: false,
  deviceMemory: 8,
  hardwareConcurrency: 8,
  hasTVAPIs: false,
}

describe('detectTVProfile', () => {
  it('does not classify a normal desktop as TV', () => {
    expect(detectTVProfile(baseInput)).toEqual({
      isTV: false,
      usePerformanceMode: false,
    })
  })

  it('detects common smart TV user agents', () => {
    expect(
      detectTVProfile({
        ...baseInput,
        userAgent: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 8.0)',
      }),
    ).toEqual({
      isTV: true,
      usePerformanceMode: true,
    })
  })

  it('detects large no-touch remote-like screens', () => {
    expect(
      detectTVProfile({
        ...baseInput,
        screenWidth: 1920,
        screenHeight: 1080,
        pointerFine: false,
        pointerCoarse: true,
        hoverNone: true,
      }),
    ).toEqual({
      isTV: true,
      usePerformanceMode: true,
    })
  })
})
