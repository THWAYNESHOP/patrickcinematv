import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Add type declarations for jest-dom matchers
declare global {
  namespace Vi {
    interface Assertion extends jest.Matchers<void, any> {
      toBeInTheDocument(): any
      toHaveTextContent(text: string | RegExp): any
      toBeVisible(): any
      toBeDisabled(): any
      toBeEnabled(): any
      toHaveClass(...classNames: string[]): any
      toHaveAttribute(attr: string, value?: any): any
      toHaveStyle(styles: Record<string, string>): any
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
