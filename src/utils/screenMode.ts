export type ScreenMode = 'contain' | 'cover' | 'fill'

export const SCREEN_MODES: ScreenMode[] = ['contain', 'cover', 'fill']

export const SCREEN_MODE_LABELS: Record<ScreenMode, string> = {
  contain: 'Fit',
  cover: 'Crop',
  fill: 'Stretch'
}

export const STORAGE_KEY = 'player_screen_mode'

export const DEFAULT_SCREEN_MODE: ScreenMode = 'contain'

export function getScreenMode(): ScreenMode {
  if (typeof window === 'undefined') return DEFAULT_SCREEN_MODE
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SCREEN_MODES.includes(stored as ScreenMode)) {
      return stored as ScreenMode
    }
  } catch (error) {
    console.warn('Failed to read screen mode from localStorage:', error)
  }
  
  return DEFAULT_SCREEN_MODE
}

export function setScreenMode(mode: ScreenMode): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch (error) {
    console.warn('Failed to save screen mode to localStorage:', error)
  }
}

export function getNextScreenMode(currentMode: ScreenMode): ScreenMode {
  const currentIndex = SCREEN_MODES.indexOf(currentMode)
  const nextIndex = (currentIndex + 1) % SCREEN_MODES.length
  return SCREEN_MODES[nextIndex]
}

export function getScreenModeLabel(mode: ScreenMode): string {
  return SCREEN_MODE_LABELS[mode]
}
