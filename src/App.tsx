import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout/Layout'
import AppRoutes from './pages/Routes'
import { ErrorBoundary } from './components/ErrorBoundary'
import ToastContainer from './components/ToastContainer'
import { useWebVitals } from './hooks/useWebVitals'
import { useSpatialNavigation } from './hooks/useSpatialNavigation'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'
import TVGuideOverlay from './components/TVGuideOverlay'

// Helper component inside App to use useNavigate
function AppContent() {
  const navigate = useNavigate()
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)
  const [isTVGuideOpen, setIsTVGuideOpen] = useState(false)

  useWebVitals()
  useSpatialNavigation()

  // Nav items for quick jump
  const navItems = [
    { path: '/', keys: ['1'] },
    { path: '/movies', keys: ['2'] },
    { path: '/tv', keys: ['3'] },
    { path: '/sports', keys: ['4'] },
    { path: '/live-tv', keys: ['5'] },
    { path: '/anime', keys: ['6'] },
    { path: '/trending', keys: ['7'] },
    { path: '/my-list', keys: ['8'] }
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open/Close shortcuts modal
      if (e.key === '?' && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setIsShortcutsModalOpen(prev => !prev)
      }

      // Open TV Guide
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setIsTVGuideOpen(prev => !prev)
      }

      // Close modals with Escape
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) setIsShortcutsModalOpen(false)
        if (isTVGuideOpen) setIsTVGuideOpen(false)
      }

      // Quick jump with 1-8
      const navItem = navItems.find(item => item.keys.includes(e.key))
      if (navItem) {
        navigate(navItem.path)
      }

      // Open search with /
      if (e.key === '/' && !e.ctrlKey && !e.altKey) {
        // We'll add this later, just a placeholder
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, isShortcutsModalOpen, isTVGuideOpen])

  return (
    <>
      <Layout>
        <AppRoutes />
        <ToastContainer />
      </Layout>
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
      <TVGuideOverlay
        isOpen={isTVGuideOpen}
        onClose={() => setIsTVGuideOpen(false)}
      />
    </>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  )
}

export default App
