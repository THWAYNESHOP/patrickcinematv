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
