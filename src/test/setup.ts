/* eslint-disable @typescript-eslint/no-namespace */
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Add type declarations for jest-dom matchers
declare global {
  namespace Vi {
    interface Assertion extends jest.Matchers<void, unknown> {
      toBeInTheDocument(): void
      toHaveTextContent(text: string | RegExp): void
      toBeVisible(): void
      toBeDisabled(): void
      toBeEnabled(): void
      toHaveClass(...classNames: string[]): void
      toHaveAttribute(attr: string, value?: unknown): void
      toHaveStyle(styles: Record<string, string>): void
    }
  }
}

// Provide dummy Firebase env variables for tests
const testEnv = import.meta.env as Record<string, string | undefined>
Object.assign(testEnv, {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ?? 'test-firebase-api-key',
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'test-firebase-project-id',
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'test-firebase-auth-domain',
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'test-firebase-storage-bucket',
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? 'test-firebase-messaging-sender-id',
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ?? 'test-firebase-app-id',
  VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'test-firebase-measurement-id',
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

// @ts-expect-error - global is not defined in TypeScript but available in test environment
global.localStorage = localStorageMock

// Cleanup after each test
afterEach(() => {
  cleanup()
  localStorageMock.clear.mockClear()
})
