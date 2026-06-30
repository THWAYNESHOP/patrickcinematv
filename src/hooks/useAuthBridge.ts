import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { useStore } from '../store/useStore'

/**
 * Keeps Zustand user state in sync with Firebase auth session.
 */
export function useAuthBridge() {
  const { user, loading } = useAuth()
  const setUser = useStore((state) => state.setUser)

  useEffect(() => {
    if (loading) return

    if (user) {
      setUser({
        id: user.uid,
        email: user.email ?? '',
        name: user.displayName ?? undefined,
      })
    } else {
      setUser(null)
    }
  }, [user, loading, setUser])
}
