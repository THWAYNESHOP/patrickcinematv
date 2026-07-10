import { useState, useEffect } from 'react'

interface TVDetectionInput {
  userAgent: string
  screenWidth: number
  screenHeight: number
  maxTouchPoints: number
  hasTouchEvent: boolean
  pointerFine: boolean
  pointerCoarse: boolean
  hoverNone: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
  hasTVAPIs?: boolean
}

interface TVDetectionProfile {
  isTV: boolean
  usePerformanceMode: boolean
}

const tvPatterns = [
  'tv',
  'smart-tv',
  'smarttv',
  'hbbtv',
  'netcast',
  'webos',
  'tizen',
  'opera tv',
  'viera',
  'bravia',
  'googletv',
  'android tv',
  'firetv',
  'roku',
  'appletv',
  'chromecast',
  'crkey',
  'espial',
  'netranger',
  'nettv',
  'kylo',
]

export function detectTVProfile(input: TVDetectionInput): TVDetectionProfile {
  const userAgent = input.userAgent.toLowerCase()
  const isTVUserAgent = tvPatterns.some((pattern) => userAgent.includes(pattern))
  const aspectRatio = input.screenHeight > 0 ? input.screenWidth / input.screenHeight : 0
  const largeLandscapeScreen = input.screenWidth >= 1280 && input.screenHeight >= 720 && aspectRatio >= 1.5
  const hasNoTouch = input.maxTouchPoints === 0 && !input.hasTouchEvent
  const remoteLikePointer = !input.pointerFine && (input.pointerCoarse || input.hoverNone)
  const lowMemory = typeof input.deviceMemory === 'number' && input.deviceMemory > 0 && input.deviceMemory <= 2
  const lowCPU =
    typeof input.hardwareConcurrency === 'number' &&
    input.hardwareConcurrency > 0 &&
    input.hardwareConcurrency <= 2

  const isLikelyTV = largeLandscapeScreen && hasNoTouch && remoteLikePointer
  const isConstrainedLargeScreen = largeLandscapeScreen && hasNoTouch && !input.pointerFine && (lowMemory || lowCPU)
  const isTV = Boolean(input.hasTVAPIs || isTVUserAgent || isLikelyTV)

  return {
    isTV,
    usePerformanceMode: isTV || isConstrainedLargeScreen,
  }
}

/**
 * Detects if the user is on a TV device
 * Checks for TV-specific user agents and characteristics
 */
export function useTVDetection() {
  const [isTV, setIsTV] = useState(false)

  useEffect(() => {
    const checkTV = () => {
      const nav = navigator as Navigator & { deviceMemory?: number }
      const win = window as Window & {
        webkitTVRemote?: unknown
        TVControl?: unknown
        tizen?: unknown
        webos?: unknown
        AmazonFireTV?: unknown
      }
      const getMediaQueryMatches = (query: string) => {
        if (typeof window.matchMedia !== 'function') return false
        return window.matchMedia(query).matches
      }
      const profile = detectTVProfile({
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        maxTouchPoints: navigator.maxTouchPoints ?? 0,
        hasTouchEvent: 'ontouchstart' in window,
        pointerFine: getMediaQueryMatches('(pointer: fine)'),
        pointerCoarse: getMediaQueryMatches('(pointer: coarse)'),
        hoverNone: getMediaQueryMatches('(hover: none)'),
        deviceMemory: nav.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        hasTVAPIs: Boolean(win.webkitTVRemote || win.TVControl || win.tizen || win.webos || win.AmazonFireTV),
      })

      setIsTV(profile.isTV)
      document.body.classList.toggle('is-tv-device', profile.isTV)
      document.body.classList.toggle('tv-performance-mode', profile.usePerformanceMode)
      document.documentElement.classList.toggle('tv-performance-mode', profile.usePerformanceMode)

      if (profile.isTV) {
        if (import.meta.env.DEV) {
          console.log('[TV Detection] TV device detected')
        }
      }
    }

    checkTV()
  }, [])

  return isTV
}
