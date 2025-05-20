// Importar o patch primeiro
import "../lib/firebase-patch"

// Importar nossa implementação segura
import { safeFirebase } from "@/lib/firebase-safe"

// Exportar as instâncias seguras
export const app = safeFirebase.getApp()
export const db = safeFirebase.getFirestore()
export const auth = safeFirebase.getAuth()
export const storage = safeFirebase.getStorage()

// Connect to emulators if in development (com tratamento de erros)
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
  try {
    const { connectFirestoreEmulator } = require("firebase/firestore")
    const { connectAuthEmulator } = require("firebase/auth")
    const { connectStorageEmulator } = require("firebase/storage")

    connectFirestoreEmulator(db, "localhost", 8080)
    connectAuthEmulator(auth, "http://localhost:9099")
    connectStorageEmulator(storage, "localhost", 9199)
  } catch (error) {
    console.error("Error connecting to emulators:", error)
  }
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
