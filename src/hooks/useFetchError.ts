import { useState, useCallback } from 'react'
import { useToast } from './useToast'

interface FetchErrorState {
  error: string | null
  isRetrying: boolean
}

export function useFetchError() {
  const [state, setState] = useState<FetchErrorState>({
    error: null,
    isRetrying: false,
  })
  const toast = useToast()

  const handleError = useCallback((error: unknown, defaultMessage: string = 'An error occurred') => {
    const message = error instanceof Error ? error.message : defaultMessage
    setState(prev => ({ ...prev, error: message }))
    toast.error(message)
  }, [toast])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const startRetry = useCallback(() => {
    setState(prev => ({ ...prev, isRetrying: true, error: null }))
  }, [])

  const endRetry = useCallback((newError?: string) => {
    setState(prev => ({
      ...prev,
      isRetrying: false,
      error: newError || null,
    }))
  }, [])

  return {
    error: state.error,
    isRetrying: state.isRetrying,
    handleError,
    clearError,
    startRetry,
    endRetry,
  }
}
