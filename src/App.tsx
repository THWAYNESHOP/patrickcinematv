import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useMemo, useState, useEffect } from 'react'
import Layout from './components/Layout/Layout'
import AppRoutes from './pages/Routes'
import { ErrorBoundary } from './components/ErrorBoundary'
import ToastContainer from './components/ToastContainer'
import { ToastProvider } from './hooks/useToast'
import { useWebVitals } from './hooks/useWebVitals'
import { useSpatialNavigation } from './hooks/useSpatialNavigation'
import { useKeyboardHandler } from './hooks/useKeyboardHandler'
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal'
import NotificationPermission from './components/Notifications/NotificationPermission'
import TVGuideOverlay from './components/TVGuideOverlay'
import NetworkStatusBanner from './components/NetworkStatusBanner'
import { useNotifications } from './hooks/useNotifications'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import { useTVDetection } from './hooks/useTVDetection'

const AuthRuntime = lazy(() => import('./components/Auth/AuthRuntime'))

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
  const [shouldLoadAuthRuntime, setShouldLoadAuthRuntime] = useState(false)
  const [shouldShowNotificationPrompt, setShouldShowNotificationPrompt] = useState(false)
  const { permission: notificationPermission } = useNotifications()
  const { isOnline, isSlowConnection, effectiveConnectionType } = useNetworkStatus()
  const location = useLocation()
  const missingConfigKeys = useMemo(() => getMissingConfigKeys(), [])
  const { registerHandler } = useKeyboardHandler()
  const isTV = useTVDetection()

  useWebVitals()
  useSpatialNavigation()

  useEffect(() => {
    type IdleCallbackHandle = number
    type IdleWindow = Window & {
      requestIdleCallback?(callback: IdleRequestCallback, options?: IdleRequestOptions): number
    }

    const win = window as IdleWindow
    let timeoutId: number | null = null
    let idleCallbackId: IdleCallbackHandle | null = null

    const scheduleAuthLoad = () => {
      if (typeof win.requestIdleCallback === 'function') {
        idleCallbackId = win.requestIdleCallback(
          () => setShouldLoadAuthRuntime(true),
          { timeout: isTV ? 5000 : 1200 }
        )
      } else {
        timeoutId = window.setTimeout(
          () => setShouldLoadAuthRuntime(true),
          isTV ? 3000 : 1200
        )
      }
    }

    scheduleAuthLoad()

    return () => {
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId)
      }
      if (idleCallbackId !== null && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleCallbackId)
      }
    }
  }, [isTV])

  useEffect(() => {
    const hasPrompted = window.localStorage.getItem('nexastream-notification-prompt-seen') === 'true'
    if (hasPrompted || location.pathname !== '/') {
      return
    }

    const isNotificationApiAvailable = typeof Notification !== 'undefined'
    if (!isNotificationApiAvailable) {
      setShouldShowNotificationPrompt(true)
      window.localStorage.setItem('nexastream-notification-prompt-seen', 'true')
      return
    }

    if (notificationPermission.canRequest) {
      setShouldShowNotificationPrompt(true)
      window.localStorage.setItem('nexastream-notification-prompt-seen', 'true')
    }
  }, [location.pathname, notificationPermission.canRequest])

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
          registerHandler(key, (e) => {
            const target = e.target as HTMLElement
            if (
              target.tagName === 'INPUT' ||
              target.tagName === 'TEXTAREA' ||
              target.isContentEditable
            ) {
              return false
            }

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
      // Dispatch soft-sync event for graceful data refresh instead of full reload
      window.dispatchEvent(new CustomEvent('nexastream:reconnected'))
      // Only reload if in a video player to ensure fresh stream sources
      if (location.pathname.includes('player') || location.pathname.includes('details')) {
        setTimeout(() => window.location.reload(), 1000)
      }
    }
  }, [isOnline, hasShownOfflineNotice, location.pathname])

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
          {shouldLoadAuthRuntime && (
            <Suspense fallback={null}>
              <AuthRuntime />
            </Suspense>
          )}
          <AppRoutes />
          <ToastContainer />
          {shouldShowNotificationPrompt && (
            <NotificationPermission onClose={() => setShouldShowNotificationPrompt(false)} />
          )}
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
      <Router>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Router>
    </ToastProvider>
  )
}

export default App
