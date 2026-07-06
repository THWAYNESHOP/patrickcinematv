import { describe, expect, it } from 'vitest'
import { shouldShowMobileNav } from './playerLayout'

describe('shouldShowMobileNav', () => {
  it('hides the mobile nav on player routes', () => {
    expect(shouldShowMobileNav('/movie/123', false)).toBe(false)
    expect(shouldShowMobileNav('/tv/456', false)).toBe(false)
    expect(shouldShowMobileNav('/sports/123', false)).toBe(false)
  })

  it('keeps the mobile nav visible on regular routes and while fullscreen is exited', () => {
    expect(shouldShowMobileNav('/movies', false)).toBe(true)
    expect(shouldShowMobileNav('/movie/123', true)).toBe(false)
    expect(shouldShowMobileNav('/my-list', false)).toBe(true)
  })
})
