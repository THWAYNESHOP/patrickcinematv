import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, sendEmailVerification, type ActionCodeSettings, type User } from 'firebase/auth';
import { app } from '../firebase';

function getAuthInstance() {
  if (!app) return null;
  return getAuth(app);
}

function getEmailVerificationSettings(): ActionCodeSettings | undefined {
  if (typeof window === 'undefined' || !window.location.origin || window.location.origin === 'null') {
    return undefined;
  }

  return {
    url: `${window.location.origin}/profile`,
    handleCodeInApp: false,
  };
}

function getAuthErrorCode(error: unknown) {
  return error && typeof error === 'object' && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';
}

function getVerificationEmailError(error: unknown) {
  const code = getAuthErrorCode(error);

  if (code === 'auth/unauthorized-continue-uri') {
    return 'Verification email was not sent because this app domain is not authorized in Firebase Authentication. Add your local/production domain under Firebase Auth > Settings > Authorized domains.';
  }

  if (code === 'auth/invalid-continue-uri') {
    return 'Verification email was not sent because the verification redirect URL is invalid.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Verification email was not sent because Firebase is rate-limiting this address. Try again later.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Verification email was not sent because the network request failed. Check your connection and try again.';
  }

  if (error instanceof Error) {
    return error.message || 'Failed to send verification email.';
  }

  return 'Failed to send verification email.';
}

async function sendVerificationEmailToUser(user: User) {
  try {
    await sendEmailVerification(user, getEmailVerificationSettings());
  } catch (error) {
    throw new Error(getVerificationEmailError(error), { cause: error });
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthInstance();
    if (!auth) {
      setLoading(false);
      return;
    }
    
    // Get initial user and listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const auth = getAuthInstance();
    if (!auth) {
      throw new Error('Firebase auth is unavailable');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (fullName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: fullName });
    }

    // Send email verification
    if (userCredential.user) {
      await sendVerificationEmailToUser(userCredential.user);
    }

    return userCredential;
  };

  const signIn = async (email: string, password: string) => {
    const auth = getAuthInstance();
    if (!auth) {
      throw new Error('Firebase auth is unavailable');
    }
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    const auth = getAuthInstance();
    if (!auth) {
      return;
    }
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    const auth = getAuthInstance();
    if (!auth) {
      return;
    }
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmail = async () => {
    const auth = getAuthInstance();
    if (!auth) {
      return;
    }
    const currentUser = auth.currentUser;
    if (currentUser) {
      await sendVerificationEmailToUser(currentUser);
    }
  };

  const isEmailVerified = () => {
    const auth = getAuthInstance();
    return auth?.currentUser?.emailVerified || false;
  };

  const signInWithGoogle = async () => {
    const auth = getAuthInstance();
    if (!auth) {
      throw new Error('Firebase auth is unavailable');
    }
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const signInWithGithub = async () => {
    const auth = getAuthInstance();
    if (!auth) {
      throw new Error('Firebase auth is unavailable');
    }
    const provider = new GithubAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    const auth = getAuthInstance();
    if (!auth || !auth.currentUser) {
      throw new Error('No user is signed in');
    }

    await updateProfile(auth.currentUser, updates);
    // Refresh the local user state
    setUser({ ...auth.currentUser });
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithGithub,
    sendVerificationEmail,
    isEmailVerified,
    updateUserProfile,
  };
}
