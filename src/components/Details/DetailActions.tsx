import { ReactNode } from 'react'

interface IconActionProps {
  icon: ReactNode
  label: string
  onClick?: () => void
  active?: boolean
}

export function IconAction({ icon, label, onClick, active = false }: IconActionProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`group flex items-center justify-center gap-2 rounded-full border transition-all duration-200 min-h-[48px] min-w-[48px] px-0 md:px-5 active:scale-95 ${
        active
          ? 'bg-primary/20 border-primary/50 text-primary'
          : 'glass border-white/15 text-white hover:bg-white/15'
      }`}
    >
      {icon}
      <span className="hidden md:inline font-semibold text-sm">{label}</span>
    </button>
  )
}

interface PlayButtonProps {
  href?: string
  onClick?: () => void
  children: ReactNode
}

export function PlayButton({ href = '#player', onClick, children }: PlayButtonProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-base transition-all duration-200 shadow-lg hover:scale-105 min-h-[48px]"
    >
      {children}
    </a>
  )
}
