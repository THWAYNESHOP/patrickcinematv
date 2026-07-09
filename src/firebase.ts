import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required Firebase config
let app: ReturnType<typeof initializeApp> | null = null
let db: ReturnType<typeof getFirestore> | null = null

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firestore
    db = getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error)
  }
} else {
  console.warn('Missing required Firebase configuration. Firebase features will be disabled.')
}

// Analytics will be initialized separately to avoid Vite dev mode issues
export { app, db };
