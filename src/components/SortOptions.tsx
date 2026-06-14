import { useState } from 'react'
import { ArrowUpDown, ChevronDown } from 'lucide-react'

interface SortOption {
  value: string
  label: string
}

interface SortOptionsProps {
  options: SortOption[]
  value: string
  onChange: (value: string) => void
}

export default function SortOptions({ options, value, onChange }: SortOptionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find(opt => opt.value === value) || options[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-300 hover:bg-white/20 rounded-lg transition-all duration-300"
      >
        <ArrowUpDown className="w-4 h-4" />
        <span className="text-sm font-medium">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-darkSurface/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 animate-fade-in">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                value === option.value
                  ? 'bg-primary/20 text-white font-medium'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
