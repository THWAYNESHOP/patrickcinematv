import { useEffect, useMemo, useState } from 'react'

type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'

interface NetworkConnectionLike {
  effectiveType?: string
  saveData?: boolean
  addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
  removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void
}

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  effectiveConnectionType: ConnectionType
}

function getConnectionInfo(): NetworkStatus {
  const navigatorWithConnection = navigator as Navigator & {
    connection?: NetworkConnectionLike
  }
  const connection = navigatorWithConnection.connection
  const effectiveType = connection?.effectiveType as ConnectionType | undefined
  const isSlowConnection = Boolean(
    connection?.saveData || effectiveType === 'slow-2g' || effectiveType === '2g'
  )

  return {
    isOnline: navigator.onLine,
    isSlowConnection,
    effectiveConnectionType: effectiveType ?? 'unknown',
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => getConnectionInfo())

  useEffect(() => {
    const updateStatus = () => setStatus(getConnectionInfo())

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    const navigatorWithConnection = navigator as Navigator & {
      connection?: NetworkConnectionLike
    }
    const connection = navigatorWithConnection.connection

    connection?.addEventListener?.('change', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      connection?.removeEventListener?.('change', updateStatus)
    }
  }, [])

  return useMemo(() => status, [status])
}
