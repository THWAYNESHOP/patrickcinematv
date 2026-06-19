import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

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
