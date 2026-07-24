/**
 * Accessibility utilities
 * Helper functions for improving accessibility across the application
 */

export function generateAriaLabel(action: string, target?: string): string {
  if (target) {
    return `${action} ${target}`
  }
  return action
}

export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstFocusable = focusableElements[0] as HTMLElement
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus()
        e.preventDefault()
      }
    }
  }

  element.addEventListener('keydown', handleTabKey)
  firstFocusable?.focus()

  return () => {
    element.removeEventListener('keydown', handleTabKey)
  }
}

export function setAriaExpanded(element: HTMLElement, expanded: boolean): void {
  element.setAttribute('aria-expanded', String(expanded))
}

export function setAriaHidden(element: HTMLElement, hidden: boolean): void {
  element.setAttribute('aria-hidden', String(hidden))
}

export function getKeyboardShortcutDescription(shortcut: string): string {
  const descriptions: Record<string, string> = {
    '/': 'Open search',
    '?': 'Show keyboard shortcuts',
    'Escape': 'Close modal',
    '1': 'Go to home',
    '2': 'Go to movies',
    '3': 'Go to TV series',
    '4': 'Go to sports',
    '5': 'Go to live TV',
    '6': 'Go to anime',
    '7': 'Go to trending',
    '8': 'Go to my list',
  }
  
  return descriptions[shortcut] || shortcut
}
