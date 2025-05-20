import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getStorage, connectStorageEmulator } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Connect to emulators if in development
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
  connectFirestoreEmulator(db, "localhost", 8080)
  connectAuthEmulator(auth, "http://localhost:9099")
  connectStorageEmulator(storage, "localhost", 9199)
}

// Função para verificar a configuração do Firebase
export function checkFirebaseConfig() {
  const configStatus = {
    apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }

  return {
    isComplete: Object.values(configStatus).every(Boolean),
    status: configStatus,
  }
}
