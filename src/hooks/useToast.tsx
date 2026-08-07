import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect, type ReactNode } from 'react'
import { ToastType } from '../components/Toast'

interface Toast {
  id: string
  type: ToastType
  message: ReactNode
  duration: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (type: ToastType, message: ReactNode, duration?: number) => string
  removeToast: (id: string) => void
  success: (message: ReactNode, duration?: number) => string
  error: (message: ReactNode, duration?: number) => string
  info: (message: ReactNode, duration?: number) => string
  warning: (message: ReactNode, duration?: number) => string
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, number>>(new Map())

  const genId = useCallback(() => {
    try {
      // @ts-ignore - lib.dom types may include crypto.randomUUID in newer TS, but guard at runtime
      if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
        return (crypto as any).randomUUID()
      }
    } catch (e) {
      // ignore
    }
    return Math.random().toString(36).substring(2, 9)
  }, [])

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((type: ToastType, message: ReactNode, duration = 5000) => {
    const id = genId()
    setToasts((prev) => [...prev, { id, type, message, duration }])

    if (duration > 0) {
      const timerId = window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
        timersRef.current.delete(id)
      }, duration)
      timersRef.current.set(id, timerId)
    }

    return id
  }, [genId])

  const success = useCallback(
    (message: ReactNode, duration?: number) => addToast('success', message, duration),
    [addToast]
  )

  const error = useCallback(
    (message: ReactNode, duration?: number) => addToast('error', message, duration),
    [addToast]
  )

  const info = useCallback(
    (message: ReactNode, duration?: number) => addToast('info', message, duration),
    [addToast]
  )

  const warning = useCallback(
    (message: ReactNode, duration?: number) => addToast('warning', message, duration),
    [addToast]
  )

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
      success,
      error,
      info,
      warning,
    }),
    [toasts, addToast, removeToast, success, error, info, warning]
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Return a no-op fallback to make hooks safe to use in tests and non-UI contexts
    return {
      toasts: [],
      addToast: () => '',
      removeToast: () => {},
      success: () => '',
      error: () => '',
      info: () => '',
      warning: () => '',
    } as ToastContextValue
  }

  return context
}
