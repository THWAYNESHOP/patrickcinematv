export function useHapticFeedback() {
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if ('vibrate' in navigator && navigator.vibrate) {
      const patterns: Record<string, number[]> = {
        light: [10],
        medium: [20],
        heavy: [40],
        success: [10, 50, 10],
        warning: [20, 30, 20],
        error: [30, 20, 30, 20],
      }
      
      navigator.vibrate(patterns[type] || patterns.light)
    }
  }

  return { triggerHaptic }
}
