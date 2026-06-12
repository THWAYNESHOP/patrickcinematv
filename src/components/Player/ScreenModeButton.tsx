import { Maximize, Minimize, Expand } from 'lucide-react'

interface ScreenModeButtonProps {
  label: string
  onClick: () => void
  showToast?: boolean
}

export default function ScreenModeButton({ label, onClick, showToast }: ScreenModeButtonProps) {
  const getIcon = () => {
    switch (label) {
      case 'Fit':
        return <Maximize className="w-5 h-5" />
      case 'Crop':
        return <Minimize className="w-5 h-5" />
      case 'Stretch':
        return <Expand className="w-5 h-5" />
      default:
        return <Maximize className="w-5 h-5" />
    }
  }

  return (
    <>
      <button
        onClick={onClick}
        title={`Screen Mode: ${label}`}
        className="p-2 hover:bg-white/20 rounded-full transition-colors"
        aria-label={`Toggle screen mode, currently ${label}`}
      >
        {getIcon()}
      </button>

      {showToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 glass px-4 py-2 rounded-lg z-50 animate-fade-in">
          <p className="text-sm font-semibold text-white">Screen Mode: {label}</p>
        </div>
      )}
    </>
  )
}
