import { useState, useEffect } from 'react'

export function useProgressiveEnhancement() {
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'unknown'>('unknown')
  const [dataSaverMode, setDataSaverMode] = useState(false)
  const [lowEndDevice, setLowEndDevice] = useState(false)

  useEffect(() => {
    // Detect connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const effectiveType = connection?.effectiveType
      
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        setConnectionSpeed('slow')
      } else if (effectiveType === '4g') {
        setConnectionSpeed('fast')
      }

      // Check data saver mode
      setDataSaverMode(connection?.saveData || false)

      // Listen for connection changes
      connection?.addEventListener('change', () => {
        const newEffectiveType = connection.effectiveType
        if (newEffectiveType === '2g' || newEffectiveType === 'slow-2g') {
          setConnectionSpeed('slow')
        } else if (newEffectiveType === '4g') {
          setConnectionSpeed('fast')
        }
        setDataSaverMode(connection.saveData)
      })
    }

    // Detect low-end device based on hardware concurrency
    if ('hardwareConcurrency' in navigator) {
      const cores = (navigator as any).hardwareConcurrency
      setLowEndDevice(cores <= 2)
    }

    // Detect low-end device based on memory
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory
      if (memory && memory <= 2) {
        setLowEndDevice(true)
      }
    }
  }, [])

  const shouldUseLowQuality = () => {
    return connectionSpeed === 'slow' || dataSaverMode || lowEndDevice
  }

  const shouldDisableAnimations = () => {
    return connectionSpeed === 'slow' || dataSaverMode || lowEndDevice
  }

  const shouldReduceData = () => {
    return connectionSpeed === 'slow' || dataSaverMode
  }

  return {
    connectionSpeed,
    dataSaverMode,
    lowEndDevice,
    shouldUseLowQuality,
    shouldDisableAnimations,
    shouldReduceData,
  }
}
