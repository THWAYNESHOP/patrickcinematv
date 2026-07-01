import { useState, useEffect } from 'react'

/**
 * Detects if the user is on a TV device
 * Checks for TV-specific user agents and characteristics
 */
export function useTVDetection() {
  const [isTV, setIsTV] = useState(false)

  useEffect(() => {
    const checkTV = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      
      // Common TV browser user agents
      const tvPatterns = [
        'tv', // Generic TV
        'smart-tv',
        'smarttv',
        'hbbtv', // Hybrid Broadcast Broadband TV
        'netcast', // LG
        'webos', // LG
        'tizen', // Samsung
        'opera tv', // Opera TV
        'viera', // Panasonic
        'bravia', // Sony
        'googletv', // Google TV
        'android tv',
        'firetv', // Amazon Fire TV
        'roku', // Roku
        'appletv', // Apple TV
        'chromecast',
        'cast',
        'crkey', // Chromecast
        'espial', // Espial TV browsers
        'netranger', // NetRanger
        'nettv', // NetTV
        'kylo', // Kylo TV browser
        'zapitti', // Zapitti
      ]

      // Check user agent for TV patterns
      const isTVUserAgent = tvPatterns.some(pattern => userAgent.includes(pattern))
      
      // Check for TV-specific characteristics
      const hasTVCharacteristics = 
        // Large screen size typical of TVs (1920x1080 or 4K)
        (window.screen.width >= 1920 && window.screen.height >= 1080) ||
        // No touch support (TVs don't have touchscreens)
        !('ontouchstart' in window) ||
        // Limited device memory (common in smart TVs)
        (((navigator as unknown) as { deviceMemory?: number }).deviceMemory || 0) <= 4 ||
        // No pointer events (TVs use remote, not mouse)
        window.matchMedia('(pointer: coarse)').matches === false

      // Check for specific TV APIs
      const hasTVAPIs = 
        Boolean(((window as unknown) as { webkitTVRemote?: unknown }).webkitTVRemote) ||
        Boolean(((window as unknown) as { TVControl?: unknown }).TVControl) ||
        Boolean(((window as unknown) as { tizen?: unknown }).tizen) ||
        Boolean(((window as unknown) as { webos?: unknown }).webos) ||
        Boolean(((window as unknown) as { AmazonFireTV?: unknown }).AmazonFireTV)

      const detected = isTVUserAgent || hasTVCharacteristics || hasTVAPIs
      
      setIsTV(detected)
      
      if (detected) {
        console.log('[TV Detection] TV device detected:', userAgent)
        // Add TV class to body for CSS targeting
        document.body.classList.add('is-tv-device')
      }
    }

    checkTV()
  }, [])

  return isTV
}
