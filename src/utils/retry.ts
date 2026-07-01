export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number
    delay?: number
    backoff?: boolean
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry,
  } = options

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxAttempts) {
        throw lastError
      }

      const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay

      onRetry?.(attempt, lastError)

      await new Promise(resolve => setTimeout(resolve, currentDelay))
    }
  }

  throw lastError!
}

export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: Parameters<typeof retry>[1]
): T {
  return ((...args: Parameters<T>) => retry(() => fn(...(args as unknown as Parameters<T>)), options)) as T
}
