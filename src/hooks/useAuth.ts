import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, sendEmailVerification, type User } from 'firebase/auth';
import { app } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    
    // Get initial user and listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const auth = getAuth(app);
    
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
    const auth = getAuth(app);
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    const auth = getAuth(app);
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    const auth = getAuth(app);
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmail = async () => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  };

  const isEmailVerified = () => {
    const auth = getAuth(app);
    return auth.currentUser?.emailVerified || false;
  };

  const signInWithGoogle = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const signInWithGithub = async () => {
    const auth = getAuth(app);
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
