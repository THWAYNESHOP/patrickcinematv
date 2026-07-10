import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
}

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500'
}

export default function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const Icon = icons[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          className="flex w-full items-center gap-2.5 rounded-md border border-white/10 bg-zinc-950/95 px-3 py-2.5 shadow-xl shadow-black/35 backdrop-blur-xl sm:gap-3 sm:px-4 sm:py-3"
        >
          <div className={`shrink-0 rounded-full p-1.5 ${colors[type]}`}>
            <Icon className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
          </div>
          <p className="min-w-0 flex-1 text-xs font-semibold leading-snug text-white sm:text-sm">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose(id), 300)
            }}
            className="shrink-0 rounded p-1 transition-colors hover:bg-white/10"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-white" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
