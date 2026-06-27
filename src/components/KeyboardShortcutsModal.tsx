import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { keys: ['G'], description: 'Open TV Guide' },
    { keys: ['?'], description: 'Open/Close this help modal' },
    { keys: ['↑', '↓', '←', '→'], description: 'Navigate between focusable elements' },
    { keys: ['Enter', 'Space'], description: 'Select/Activate focused element' },
    { keys: ['Escape'], description: 'Close modal/Go back' },
    { keys: ['/'], description: 'Open Search' },
    { keys: ['1', '2', '3', '4', '5', '6', '7', '8'], description: 'Quick jump to section (1-8)' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-darkSurface border border-white/10 rounded-2xl p-6 md:p-8 max-w-2xl w-[90%] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Keyboard & Remote Shortcuts</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors tv-focusable tv-touch-target"
                aria-label="Close shortcuts modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Shortcuts Grid */}
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0"
                >
                  <span className="text-gray-300 text-sm md:text-base">{shortcut.description}</span>
                  <div className="flex items-center gap-2">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span
                        key={keyIndex}
                        className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white font-semibold text-sm min-w-[32px] text-center"
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Close Hint */}
            <p className="text-gray-500 text-xs md:text-sm text-center mt-6">
              Press <kbd className="px-2 py-0.5 bg-white/10 rounded text-white">Escape</kbd> or <kbd className="px-2 py-0.5 bg-white/10 rounded text-white">?</kbd> to close
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
