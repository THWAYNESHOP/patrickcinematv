import { describe, it, expect, beforeEach } from 'vitest'
import { getCached, setCached, clearCache } from './apiCache'

describe('apiCache', () => {
  beforeEach(() => {
    clearCache()
  })

  it('should return null for non-existent cache', () => {
    const result = getCached('non-existent-key')
    expect(result).toBeNull()
  })

  it('should set and get cached data', () => {
    const testData = { id: 1, name: 'Test' }
    setCached('test-key', testData)
    
    const result = getCached('test-key')
    expect(result).toEqual(testData)
  })

  it('should clear all cache', () => {
    setCached('key1', { data: 1 })
    setCached('key2', { data: 2 })
    
    clearCache()
    
    expect(getCached('key1')).toBeNull()
    expect(getCached('key2')).toBeNull()
  })
})
