import { useState } from 'react'
import { Filter, ChevronDown } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
  type: 'select' | 'multi-select'
}

interface FiltersProps {
  groups: FilterGroup[]
  onFilterChange: (filters: Record<string, string[]>) => void
  activeFilters?: Record<string, string[]>
}

export default function Filters({ groups, onFilterChange, activeFilters = {} }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(activeFilters)

  const toggleFilter = (groupId: string, value: string) => {
    setLocalFilters(prev => {
      const current = prev[groupId] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [groupId]: updated }
    })
  }

  const applyFilters = () => {
    onFilterChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setLocalFilters({})
    onFilterChange({})
    setIsOpen(false)
  }

  const hasActiveFilters = Object.values(localFilters).some(values => values.length > 0)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          hasActiveFilters
            ? 'bg-primary text-white'
            : 'bg-white/10 text-gray-300 hover:bg-white/20'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filters</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-white rounded-full" />
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-darkSurface/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 animate-fade-in">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {groups.map((group) => (
              <div key={group.id}>
                <label className="text-gray-400 text-sm mb-2 block">{group.label}</label>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const isSelected = localFilters[group.id]?.includes(option.value)
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleFilter(group.id, option.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/10 flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
