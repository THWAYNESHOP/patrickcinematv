/**
 * Centralized error handling utility
 * Provides consistent error handling across the application
 */

interface WindowWithSentry extends Window {
  Sentry?: {
    captureException: (error: Error, context?: { extra?: unknown }) => void
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred', details?: unknown) {
    super(message, 'NETWORK_ERROR', 0, details)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details)
    this.name = 'AuthenticationError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', details?: unknown) {
    super(message, 'RATE_LIMIT_ERROR', 429, details)
    this.name = 'RateLimitError'
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError(error.message, error)
    }
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return new AuthenticationError(error.message, error)
    }

    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return new RateLimitError(error.message, error)
    }

    return new AppError(error.message, 'UNKNOWN_ERROR', 500, error)
  }

  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR', 500, error)
}

export function logError(error: AppError, context?: string): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context: context || 'Unknown',
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
  }

  // In development, log to console
  if (import.meta.env.DEV) {
    console.error('[Error]', errorLog)
  }

  // In production, send to error tracking service
  if (!import.meta.env.DEV) {
    // Send to Sentry or other error tracking
    const sentry = (window as WindowWithSentry).Sentry
    if (typeof window !== 'undefined' && sentry?.captureException) {
      sentry.captureException(error, { extra: errorLog })
    }
  }
}
