import { BrowserRouter as Router, useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import Layout from './components/Layout/Layout'
import AppRoutes from './pages/Routes'
import { ErrorBoundary } from './components/ErrorBoundary'
import ToastContainer from './components/ToastContainer'
import { ToastProvider } from './hooks/useToast'
import { useWebVitals } from './hooks/useWebVitals'
import { useSpatialNavigation } from './hooks/useSpatialNavigation'
import { useKeyboardHandler } from './hooks/useKeyboardHandler'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'
import TVGuideOverlay from './components/TVGuideOverlay'
import NetworkStatusBanner from './components/NetworkStatusBanner'
import { useAuthBridge } from './hooks/useAuthBridge'
import { useFirestoreSync, useFirestoreRealtime } from './hooks/useFirestoreSync'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import EmailVerificationBanner from './components/Auth/EmailVerificationBanner'

const MISSING_CONFIG_KEYS = [
  'VITE_TMDB_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]

function getMissingConfigKeys() {
  return MISSING_CONFIG_KEYS.filter((key) => !import.meta.env[key])
}

// Helper component inside App to use useNavigate
function AppContent() {
  const navigate = useNavigate()
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)
  const [isTVGuideOpen, setIsTVGuideOpen] = useState(false)
  const [hasShownOfflineNotice, setHasShownOfflineNotice] = useState(false)
  const { isOnline, isSlowConnection, effectiveConnectionType } = useNetworkStatus()
  const missingConfigKeys = useMemo(() => getMissingConfigKeys(), [])
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

    return () => {
      unregister.forEach(fn => fn())
    }
  }, [navigate, isShortcutsModalOpen, isTVGuideOpen, registerHandler])

  useEffect(() => {
    if (isOnline && hasShownOfflineNotice) {
      setHasShownOfflineNotice(false)
      window.location.reload()
    }
  }, [isOnline, hasShownOfflineNotice])

  const globalErrorMessage = missingConfigKeys.length
    ? `Missing configuration: ${missingConfigKeys.join(', ')}. Some features may not work.`
    : !isOnline
    ? 'You appear to be offline. Some content may not load until connectivity is restored.'
    : isSlowConnection
    ? `Your connection looks slow (${effectiveConnectionType}). Streaming may buffer more than usual.`
    : null

  useEffect(() => {
    if (!isOnline) {
      setHasShownOfflineNotice(true)
    }
  }, [isOnline])

  return (
    <>
      <NetworkStatusBanner
        message={globalErrorMessage}
        onRetry={isOnline ? undefined : () => window.location.reload()}
      />
      <div className={globalErrorMessage ? 'pt-16' : ''}>
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
      </div>
    </>
  )
}

function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <Router>
          <AppContent />
        </Router>
      </ErrorBoundary>
    </ToastProvider>
  )
}

export default App
