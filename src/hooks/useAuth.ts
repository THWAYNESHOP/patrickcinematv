import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, sendEmailVerification, type User } from 'firebase/auth';
import { app } from '../firebase';

function getAuthInstance() {
  if (!app) return null;
  return getAuth(app);
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
      await sendEmailVerification(userCredential.user);
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
      await sendEmailVerification(currentUser);
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
  };
}
