// Importar o patch primeiro
import "./firebase-patch"

// Tipo para objetos Firebase mockados
type MockedFirebase = {
  isMock: true
  [key: string]: any
}

// Função para criar um proxy seguro que intercepta chamadas problemáticas
function createSafeProxy(target: any, name: string): any {
  return new Proxy(target || {}, {
    get: (obj, prop) => {
      try {
        const value = obj[prop]
        if (typeof value === "function") {
          return (...args: any[]) => {
            try {
              return value.apply(obj, args)
            } catch (e) {
              console.error(`Error calling ${String(prop)} on ${name}:`, e)
              return null
            }
          }
        }
        return value
      } catch (e) {
        console.error(`Error accessing ${String(prop)} on ${name}:`, e)
        return null
      }
    },
    set: (obj, prop, value) => {
      try {
        obj[prop] = value
        return true
      } catch (e) {
        console.error(`Error setting ${String(prop)} on ${name}:`, e)
        return false
      }
    },
  })
}

// Função para criar um objeto Firebase mockado
function createMockFirebase(): MockedFirebase {
  return {
    isMock: true,
    app: createSafeProxy({}, "app"),
    auth: createSafeProxy(
      {
        currentUser: null,
        onAuthStateChanged: (callback: any) => {
          callback(null)
          return () => {}
        },
        signInWithEmailAndPassword: async () => ({ user: null }),
        signOut: async () => {},
      },
      "auth",
    ),
    firestore: createSafeProxy(
      {
        collection: () => ({
          doc: () => ({
            get: async () => ({ exists: false, data: () => ({}) }),
            set: async () => {},
          }),
          where: () => ({
            get: async () => ({ empty: true, docs: [] }),
          }),
          orderBy: () => ({
            get: async () => ({ empty: true, docs: [] }),
          }),
        }),
      },
      "firestore",
    ),
    storage: createSafeProxy(
      {
        ref: () => ({
          put: async () => ({
            ref: {
              getDownloadURL: async () => "",
            },
          }),
          getDownloadURL: async () => "",
        }),
      },
      "storage",
    ),
  }
}

// Variáveis para armazenar as instâncias do Firebase
let _app: any = null
let _db: any = null
let _auth: any = null
let _storage: any = null

// Função para inicializar o app do Firebase com segurança
export function getFirebaseApp() {
  if (typeof window === "undefined") {
    // No lado do servidor, retornar um mock
    return createMockFirebase().app
  }

  if (_app) return _app

  try {
    // Importar Firebase de forma dinâmica para evitar problemas de SSR
    const firebase = require("firebase/app")
    const { initializeApp, getApps, getApp } = firebase

    // Aplicar o patch para desativar logging
    import("./firebase-patch").then(({ disableFirebaseLogging }) => {
      disableFirebaseLogging(firebase)
    })

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }

    _app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    return _app
  } catch (error) {
    console.error("Error initializing Firebase app:", error)
    return createMockFirebase().app
  }
}

// Função para obter o Firestore com segurança
export function getFirestoreDb() {
  if (typeof window === "undefined") {
    // No lado do servidor, retornar um mock
    return createMockFirebase().firestore
  }

  if (_db) return _db

  try {
    const app = getFirebaseApp()
    const { getFirestore } = require("firebase/firestore")
    _db = getFirestore(app)
    return _db
  } catch (error) {
    console.error("Error initializing Firestore:", error)
    return createMockFirebase().firestore
  }
}

// Função para obter a autenticação com segurança
export function getFirebaseAuth() {
  if (typeof window === "undefined") {
    // No lado do servidor, retornar um mock
    return createMockFirebase().auth
  }

  if (_auth) return _auth

  try {
    const app = getFirebaseApp()
    const { getAuth } = require("firebase/auth")
    _auth = getAuth(app)
    return _auth
  } catch (error) {
    console.error("Error initializing Auth:", error)
    return createMockFirebase().auth
  }
}

// Função para obter o storage com segurança
export function getFirebaseStorage() {
  if (typeof window === "undefined") {
    // No lado do servidor, retornar um mock
    return createMockFirebase().storage
  }

  if (_storage) return _storage

  try {
    const app = getFirebaseApp()
    const { getStorage } = require("firebase/storage")
    _storage = getStorage(app)
    return _storage
  } catch (error) {
    console.error("Error initializing Storage:", error)
    return createMockFirebase().storage
  }
}

// Exportar funções seguras para uso em toda a aplicação
export const safeFirebase = {
  getApp: getFirebaseApp,
  getFirestore: getFirestoreDb,
  getAuth: getFirebaseAuth,
  getStorage: getFirebaseStorage,
}
