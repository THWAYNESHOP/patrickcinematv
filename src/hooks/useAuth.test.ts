import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth'

// Mock Firebase
vi.mock('../firebase', () => ({
  app: {},
}))

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    // Call asynchronously so hook initial loading state remains true
    setTimeout(() => callback(null), 0)
    return vi.fn()
  }),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  GithubAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  sendEmailVerification: vi.fn(),
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with no user and loading state', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('should provide auth functions', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signUp).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
    expect(typeof result.current.resetPassword).toBe('function')
    expect(typeof result.current.signInWithGoogle).toBe('function')
    expect(typeof result.current.signInWithGithub).toBe('function')
  })

  it('sends an email verification after sign up', async () => {
    const firebaseUser = {
      uid: 'user-1',
      email: 'new-user@example.com',
      displayName: null,
    }

    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: firebaseUser,
    } as Awaited<ReturnType<typeof createUserWithEmailAndPassword>>)
    vi.mocked(updateProfile).mockResolvedValue()
    vi.mocked(sendEmailVerification).mockResolvedValue()

    const { result } = renderHook(() => useAuth())

    await result.current.signUp('new-user@example.com', 'password123', 'New User')

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'new-user@example.com',
      'password123',
    )
    expect(updateProfile).toHaveBeenCalledWith(firebaseUser, { displayName: 'New User' })
    expect(sendEmailVerification).toHaveBeenCalledWith(
      firebaseUser,
      expect.objectContaining({
        handleCodeInApp: false,
        url: expect.stringContaining('/profile'),
      }),
    )
  })
})
