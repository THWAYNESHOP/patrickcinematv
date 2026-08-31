import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  detailType?: 'movie' | 'tv' | 'anime'
}

/**
 * ProtectedRoute component that ensures users are logged in before accessing detail pages.
 * If user is not logged in, it shows the auth modal and stores the intended navigation.
 */
export default function ProtectedRoute({ children, detailType }: ProtectedRouteProps) {
  const user = useStore((state) => state.user)
  const setIsAuthModalOpen = useStore((state) => state.setIsAuthModalOpen)
  const setPendingCardNavigation = useStore((state) => state.setPendingCardNavigation)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // If user is not logged in, show auth modal and store the pending navigation
    if (!user) {
      // Extract ID from the current route
      const pathSegments = location.pathname.split('/')
      const id = pathSegments[pathSegments.length - 1]
      
      if (detailType && id) {
        setPendingCardNavigation({
          type: detailType,
          id,
        })
      }
      
      setIsAuthModalOpen(true)
      
      // Optionally navigate back to home
      // navigate('/')
    }
  }, [user, detailType, location.pathname, setIsAuthModalOpen, setPendingCardNavigation, navigate])

  // Show children only if user is logged in
  if (!user) {
    return null
  }

  return <>{children}</>
}
