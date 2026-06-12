import { useState, useEffect } from 'react'
import { 
  ScreenMode, 
  getScreenMode, 
  setScreenMode, 
  getNextScreenMode, 
  getScreenModeLabel 
} from '../utils/screenMode'

export function useScreenMode() {
  const [mode, setModeState] = useState<ScreenMode>(getScreenMode)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    setModeState(getScreenMode())
  }, [])

  const setMode = (newMode: ScreenMode) => {
    setModeState(newMode)
    setScreenMode(newMode)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const cycleMode = () => {
    const nextMode = getNextScreenMode(mode)
    setMode(nextMode)
  }

  return {
    mode,
    label: getScreenModeLabel(mode),
    setMode,
    cycleMode,
    showToast
  }
}
