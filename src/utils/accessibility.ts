// Comprehensive accessibility utilities

// Skip link component for keyboard navigation
export function createSkipLink(href: string, text: string): HTMLAnchorElement {
  const link = document.createElement('a')
  link.href = href
  link.textContent = text
  link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded focus:transition-all'
  link.setAttribute('aria-label', text)
  return link
}

// Initialize skip links on mount
export function initializeSkipLinks() {
  if (typeof document === 'undefined') return
  
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
  ]
  
  skipLinks.forEach(({ href, text }) => {
    const link = createSkipLink(href, text)
    document.body.prepend(link)
  })
}

// ARIA live region manager for dynamic content announcements
export class LiveRegionManager {
  private regions: Map<string, HTMLElement> = new Map()
  
  createRegion(id: string, level: 'polite' | 'assertive' = 'polite'): HTMLElement {
    if (this.regions.has(id)) {
      return this.regions.get(id)!
    }
    
    const region = document.createElement('div')
    region.id = id
    region.setAttribute('aria-live', level)
    region.setAttribute('aria-atomic', 'true')
    region.className = 'sr-only'
    document.body.appendChild(region)
    
    this.regions.set(id, region)
    return region
  }
  
  announce(id: string, message: string, level: 'polite' | 'assertive' = 'polite'): void {
    let region = this.regions.get(id)
    
    if (!region) {
      region = this.createRegion(id, level)
    }
    
    // Clear previous content and set new message
    region.textContent = ''
    setTimeout(() => {
      region.textContent = message
    }, 100)
  }
  
  removeRegion(id: string): void {
    const region = this.regions.get(id)
    if (region) {
      document.body.removeChild(region)
      this.regions.delete(id)
    }
  }
  
  cleanup(): void {
    this.regions.forEach((region) => {
      document.body.removeChild(region)
    })
    this.regions.clear()
  }
}

// Focus management utilities
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }
  
  element.addEventListener('keydown', handleTabKey)
  
  // Focus first element
  firstFocusable?.focus()
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

// Screen reader announcement for important state changes
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Enhanced keyboard navigation patterns
export function setupKeyboardNavigation(options: {
  container: HTMLElement
  shortcuts: Record<string, () => void>
  }) {
  const { container, shortcuts } = options
  
  const handleKeyDown = (e: KeyboardEvent) => {
    const handler = shortcuts[e.key]
    if (handler) {
      // Prevent default behavior for accessibility shortcuts
      if (e.key === 'Escape' || e.key === 'Tab') {
        // Let default behavior pass for these keys
        return
      }
      e.preventDefault()
      handler()
    }
  }
  
  container.addEventListener('keydown', handleKeyDown)
  
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

// Color contrast checker for accessibility compliance
export function checkColorContrast(foreground: string, background: string): {
  ratio: number
  passesAA: boolean
  passesAAA: boolean
} {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }
  
  const fg = hexToRgb(foreground)
  const bg = hexToRgb(background)
  
  // Calculate relative luminance
  const luminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }
  
  const lum1 = luminance(fg.r, fg.g, fg.b)
  const lum2 = luminance(bg.r, bg.g, bg.b)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  const ratio = (brightest + 0.05) / (darkest + 0.05)
  
  return {
    ratio,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  }
}

// ARIA attribute generator for dynamic content
export function generateAriaProps(options: {
  label?: string
  describedBy?: string
  expanded?: boolean
  pressed?: boolean
  selected?: boolean
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  live?: 'polite' | 'assertive' | 'off'
}): Record<string, string | boolean> {
  const props: Record<string, string | boolean> = {}
  
  if (options.label) props['aria-label'] = options.label
  if (options.describedBy) props['aria-describedby'] = options.describedBy
  if (options.expanded !== undefined) props['aria-expanded'] = options.expanded
  if (options.pressed !== undefined) props['aria-pressed'] = options.pressed
  if (options.selected !== undefined) props['aria-selected'] = options.selected
  if (options.disabled !== undefined) props['aria-disabled'] = options.disabled
  if (options.required !== undefined) props['aria-required'] = options.required
  if (options.invalid !== undefined) props['aria-invalid'] = options.invalid
  if (options.live) props['aria-live'] = options.live
  
  return props
}

// Reduced motion preference check
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Apply reduced motion animations
export function getAnimationProps(motion: boolean = true) {
  if (!motion || prefersReducedMotion()) {
    return {
      style: {
        animation: 'none',
        transition: 'none',
      },
    }
  }
  
  return {}
}

// Screen reader only utility class generator
export function getSrOnlyClass(): string {
  return 'sr-only'
}

// Visible on focus utility for skip links
export function getFocusVisibleClass(): string {
  return 'focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded'
}

// Export singleton instance
export const liveRegionManager = new LiveRegionManager()