import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import '@testing-library/jest-dom'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock localStorage
const storage = new Map<string, string>()

const localStorageMock = {
  getItem: vi.fn((key: string) => (storage.has(key) ? storage.get(key) ?? null : null)),
  setItem: vi.fn((key: string, value: string) => {
    storage.set(key, String(value))
  }),
  removeItem: vi.fn((key: string) => {
    storage.delete(key)
  }),
  clear: vi.fn(() => {
    storage.clear()
  }),
  get length() {
    return storage.size
  },
  key: vi.fn((index: number) => Array.from(storage.keys())[index] ?? null),
}

// Assign mock localStorage to the global object for tests
globalThis.localStorage = localStorageMock as unknown as Storage

// Cleanup after each test
afterEach(() => {
  cleanup()
  localStorageMock.clear()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  localStorageMock.key.mockClear()
})
