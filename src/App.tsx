import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout/Layout'
import AppRoutes from './pages/Routes'
import { ErrorBoundary } from './components/ErrorBoundary'
import ToastContainer from './components/ToastContainer'
import { useWebVitals } from './hooks/useWebVitals'
import { useSpatialNavigation } from './hooks/useSpatialNavigation'
import { useKeyboardHandler } from './hooks/useKeyboardHandler'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'
import TVGuideOverlay from './components/TVGuideOverlay'
import { useAuthBridge } from './hooks/useAuthBridge'
import { useFirestoreSync, useFirestoreRealtime } from './hooks/useFirestoreSync'
import EmailVerificationBanner from './components/Auth/EmailVerificationBanner'

// Helper component inside App to use useNavigate
function AppContent() {
  const navigate = useNavigate()
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)
  const [isTVGuideOpen, setIsTVGuideOpen] = useState(false)
  const { registerHandler } = useKeyboardHandler()

  useWebVitals()
  useSpatialNavigation()
  useAuthBridge()
  useFirestoreSync()
  useFirestoreRealtime()

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

  // Register keyboard handlers using centralized system
  useEffect(() => {
    const unregister: (() => void)[] = []

    // Open/Close shortcuts modal
    unregister.push(
      registerHandler('?', (e) => {
        if (!e.ctrlKey && !e.altKey) {
          setIsShortcutsModalOpen(prev => !prev)
        }
      })
    )

    // Close modals with Escape
    unregister.push(
      registerHandler('Escape', () => {
        if (isShortcutsModalOpen) setIsShortcutsModalOpen(false)
        if (isTVGuideOpen) setIsTVGuideOpen(false)
      })
    )

    // Quick jump with 1-8
    navItems.forEach(item => {
      item.keys.forEach(key => {
        unregister.push(
          registerHandler(key, () => {
            navigate(item.path)
          })
        )
      })
    })

    // Open search with /
    unregister.push(
      registerHandler('/', (e) => {
        if (e.ctrlKey || e.altKey) return false

        const target = e.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return false
        }

        window.dispatchEvent(new CustomEvent('nexastream:open-search'))
      })
    )

    return () => unregister.forEach(fn => fn())
  }, [navigate, isShortcutsModalOpen, isTVGuideOpen, registerHandler])

  return (
    <>
      <Layout>
        <EmailVerificationBanner />
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
