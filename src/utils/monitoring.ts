/**
 * Monitoring and Analytics Setup
 * Integrates with Sentry for error tracking and performance monitoring
 */

// Type-safe monitoring interface
interface MonitoringService {
  init: (dsn: string, options?: Record<string, unknown>) => void
  trackUserAction: (action: string, properties?: Record<string, unknown>) => void
  trackError: (error: Error, context?: Record<string, unknown>) => void
  trackPerformance: (transactionName: string, operation: string) => void
}

// Placeholder implementation - replace with actual Sentry when installed
const monitoringService: MonitoringService = {
  init: (dsn: string, _options?: Record<string, unknown>) => {
    if (import.meta.env.PROD && dsn) {
      console.log('[Monitoring] Initialized with DSN:', dsn.substring(0, 10) + '...')
      // Initialize Sentry here when installed
      // import('@sentry/react').then(Sentry => Sentry.init({ dsn, ..._options }))
    }
  },
  trackUserAction: (action: string, properties?: Record<string, unknown>) => {
    if (import.meta.env.PROD) {
      console.log('[Monitoring] User action:', action, properties)
      // Sentry.addBreadcrumb when installed
    }
  },
  trackError: (error: Error, context?: Record<string, unknown>) => {
    if (import.meta.env.PROD) {
      console.error('[Monitoring] Error tracked:', error.message, context)
      // Sentry.captureException when installed
    }
  },
  trackPerformance: (transactionName: string, operation: string) => {
    if (import.meta.env.PROD) {
      console.log('[Monitoring] Performance:', transactionName, operation)
      // Sentry.startTransaction when installed
    }
  },
}

export function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (dsn) {
    monitoringService.init(dsn, {
      environment: import.meta.env.MODE,
    })
  }
}

export function trackUserAction(action: string, properties?: Record<string, unknown>) {
  monitoringService.trackUserAction(action, properties)
}

export function trackError(error: Error, context?: Record<string, unknown>) {
  monitoringService.trackError(error, context)
}

export function trackPerformance(transactionName: string, operation: string) {
  monitoringService.trackPerformance(transactionName, operation)
}
