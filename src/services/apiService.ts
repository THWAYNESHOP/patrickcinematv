/**
 * Centralized API Service Layer
 * Provides a unified interface for all API calls with error handling, caching, and retry logic
 */

import { handleError, logError, AppError } from '../utils/errorHandler'
import { getCached, setCached } from '../utils/apiCache'

export interface ApiResponse<T> {
  data: T
  status: number
  headers?: Headers
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
  retries?: number
  cacheKey?: string
  cacheTTL?: number
}

class ApiService {
  private baseURL: string
  private defaultTimeout: number = 10000
  private defaultRetries: number = 2

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async fetchWithRetry<T>(
    url: string,
    config: ApiRequestConfig = {},
    attempt: number = 0
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
    } = config

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new AppError(
          `HTTP error! status: ${response.status}`,
          'HTTP_ERROR',
          response.status
        )
      }

      const data = await response.json()

      return {
        data,
        status: response.status,
        headers: response.headers,
      }
    } catch (error) {
      const appError = handleError(error)

      // Retry on network errors or 5xx errors
      if (
        attempt < retries &&
        (appError.code === 'NETWORK_ERROR' || appError.statusCode >= 500)
      ) {
        logError(appError, `API retry ${attempt + 1}/${retries}`)
        await this.delay(1000 * (attempt + 1)) // Exponential backoff
        return this.fetchWithRetry<T>(url, config, attempt + 1)
      }

      logError(appError, 'API request failed')
      throw appError
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async get<T>(url: string, config: ApiRequestConfig = {}): Promise<T> {
    const { cacheKey, cacheTTL } = config

    // Check cache first
    if (cacheKey) {
      const cached = getCached<T>(cacheKey)
      if (cached) return cached
    }

    const response = await this.fetchWithRetry<T>(url, { ...config, method: 'GET' })

    // Cache response
    if (cacheKey && cacheTTL) {
      setCached(cacheKey, response.data)
    }

    return response.data
  }

  async post<T>(url: string, body: unknown, config: ApiRequestConfig = {}): Promise<T> {
    const response = await this.fetchWithRetry<T>(url, { ...config, method: 'POST', body })
    return response.data
  }

  async put<T>(url: string, body: unknown, config: ApiRequestConfig = {}): Promise<T> {
    const response = await this.fetchWithRetry<T>(url, { ...config, method: 'PUT', body })
    return response.data
  }

  async delete<T>(url: string, config: ApiRequestConfig = {}): Promise<T> {
    const response = await this.fetchWithRetry<T>(url, { ...config, method: 'DELETE' })
    return response.data
  }

  async patch<T>(url: string, body: unknown, config: ApiRequestConfig = {}): Promise<T> {
    const response = await this.fetchWithRetry<T>(url, { ...config, method: 'PATCH', body })
    return response.data
  }
}

// Create service instances for different APIs
export const tmdbService = new ApiService(
  import.meta.env.DEV ? 'https://api.themoviedb.org/3' : '/api/tmdb'
)

export const sportsService = new ApiService(
  import.meta.env.DEV ? 'https://streamed.pk/api' : '/api/sports'
)

export const apiService = new ApiService('/api')
