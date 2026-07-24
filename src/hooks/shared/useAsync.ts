/**
 * Shared async utilities
 * Consolidated async state management patterns
 */

import { useState, useCallback, useEffect } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseAsyncOptions<T> {
  initialData?: T | null
  executeOnMount?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { initialData = null, executeOnMount = true, onSuccess, onError } = options
  
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: executeOnMount,
    error: null,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await asyncFunction()
      setState({ data: result, loading: false, error: null })
      onSuccess?.(result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState(prev => ({ ...prev, loading: false, error: err }))
      onError?.(err)
      throw err
    }
  }, [asyncFunction, onSuccess, onError])

  useEffect(() => {
    if (executeOnMount) {
      execute()
    }
  }, [executeOnMount, execute])

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null })
  }, [initialData])

  return {
    ...state,
    execute,
    reset,
  }
}

export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  dependencies: unknown[] = [],
  options: UseAsyncOptions<T> = {}
) {
  const result = useAsync(asyncFunction, { ...options, executeOnMount: false })

  useEffect(() => {
    result.execute()
  }, dependencies)

  return result
}
