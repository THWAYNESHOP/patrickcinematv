import { useToast } from '../hooks/useToast'
import Toast, { type ToastType } from './Toast'

type ToastItem = {
  id: string
  type: ToastType
  message: string
  duration: number
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[100] flex flex-col gap-2 sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-6 sm:w-[min(24rem,calc(100vw-3rem))]">
      {toasts.map((toast: ToastItem) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  )
}
