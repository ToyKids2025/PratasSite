// Importar a inicialização segura primeiro
import "../lib/firebase-init"

import { cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Desabilitar logging para evitar erros de conversão
if (typeof process !== "undefined") {
  // @ts-ignore
  process.env.FIREBASE_LOGGING_DISABLED = "true"
}

// Função para inicializar o Firebase Admin SDK com tratamento de erros
function getFirebaseAdminApp() {
  try {
    const { initializeApp, getApps, getApp } = require("firebase-admin/app")

    if (getApps().length === 0) {
      try {
        // Converter a chave privada de string para formato correto
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : undefined

        // Verificar se as credenciais estão disponíveis
        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
          console.warn("Firebase Admin SDK credentials are missing. Using mock data instead.")
          return null
        }

        // Inicializar o app
        return initializeApp({
          credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        })
      } catch (error) {
        console.error("Error initializing Firebase Admin:", error)
        return null
      }
    }

    return getApp()
  } catch (error) {
    console.error("Error in getFirebaseAdminApp:", error)
    return null
  }
}

// Obter a instância do Firestore Admin com tratamento de erros
let _db: any = null

export function getAdminDb() {
  if (!_db) {
    try {
      const app = getFirebaseAdminApp()
      if (app) {
        _db = getFirestore(app)
      }
    } catch (error) {
      console.error("Error getting admin db:", error)
    }
  }
  return _db
}

// Exportar diretamente o db para compatibilidade com código existente
export const db = getAdminDb()

// Converter Firestore data para nosso tipo Product
export function convertFirestoreProduct(id: string, data: any) {
  try {
    // Verificar se data é um objeto válido
    if (!data || typeof data !== "object") {
      throw new Error("Invalid Firestore data")
    }

    // Processar campos com verificações de tipo
    const name = data.name || ""
    const originalPrice = typeof data.originalPrice === "number" ? data.originalPrice : 0
    const currentPrice = typeof data.currentPrice === "number" ? data.currentPrice : 0
    const description = data.description || ""
    const images = Array.isArray(data.images) ? data.images : []
    const category = data.category || ""
    const features = Array.isArray(data.features) ? data.features : []
    const stock = typeof data.stock === "number" ? data.stock : 0

    // Processar datas com verificações
    let createdAt = new Date()
    if (data.createdAt) {
      try {
        if (data.createdAt.toDate && typeof data.createdAt.toDate === "function") {
          createdAt = data.createdAt.toDate()
        } else if (data.createdAt._seconds) {
          createdAt = new Date(data.createdAt._seconds * 1000)
        } else {
          createdAt = new Date(data.createdAt)
        }
      } catch (e) {
        console.error("Error converting createdAt:", e)
      }
    }

    let updatedAt = new Date()
    if (data.updatedAt) {
      try {
        if (data.updatedAt.toDate && typeof data.updatedAt.toDate === "function") {
          updatedAt = data.updatedAt.toDate()
        } else if (data.updatedAt._seconds) {
          updatedAt = new Date(data.updatedAt._seconds * 1000)
        } else {
          updatedAt = new Date(data.updatedAt)
        }
      } catch (e) {
        console.error("Error converting updatedAt:", e)
      }
    }

    // Processar promoção com verificações
    let promotion = null
    if (data.promotion && typeof data.promotion === "object") {
      let endDate = null
      if (data.promotion.endDate) {
        try {
          if (data.promotion.endDate.toDate && typeof data.promotion.endDate.toDate === "function") {
            endDate = data.promotion.endDate.toDate()
          } else if (data.promotion.endDate._seconds) {
            endDate = new Date(data.promotion.endDate._seconds * 1000)
          } else {
            endDate = new Date(data.promotion.endDate)
          }
        } catch (e) {
          console.error("Error converting promotion endDate:", e)
        }
      }

      promotion = {
        active: data.promotion.active === true,
        endDate: endDate,
        discountPercentage:
          typeof data.promotion.discountPercentage === "number" ? data.promotion.discountPercentage : 0,
        badge: data.promotion.badge || null,
        type: data.promotion.type || null,
      }
    }

    return {
      id,
      name,
      originalPrice,
      currentPrice,
      description,
      images,
      category,
      features,
      stock,
      promotion,
      createdAt,
      updatedAt,
    }
  } catch (error) {
    console.error("Error converting Firestore product:", error)
    return {
      id,
      name: data?.name || "",
      originalPrice: 0,
      currentPrice: 0,
      description: "",
      images: [],
      category: "",
      features: [],
      stock: 0,
      promotion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
}

// Remover os dados mock
const mockProducts = []

// Modificar a função getAllProductsAdmin para retornar uma lista vazia quando não houver produtos
export async function getAllProductsAdmin() {
  try {
    const db = getAdminDb()
    // Se o db não estiver disponível, retornar dados mock (agora vazio)
    if (!db) {
      console.log("Using mock products data (empty)")
      return mockProducts
    }

    const productsRef = db.collection("products")
    const productsSnap = await productsRef.orderBy("createdAt", "desc").get()

    const products = []

    // Verificar se productsSnap é válido e tem o método forEach
    if (!productsSnap || typeof productsSnap.forEach !== "function") {
      console.error("Invalid products snapshot")
      return []
    }

    // Usar try/catch para cada documento para evitar falhas em toda a operação
    productsSnap.forEach((doc) => {
      try {
        if (!doc || !doc.id || typeof doc.data !== "function") {
          console.warn("Invalid document in snapshot")
          return
        }

        const data = doc.data()

        // Converter o documento para um formato seguro
        const product = convertFirestoreProduct(doc.id, data)
        products.push(product)
      } catch (docError) {
        console.error("Error processing document:", docError)
      }
    })

    return products
  } catch (error) {
    console.error("Error getting all products with admin:", error)
    // Fallback para dados mock em caso de erro (agora vazio)
    return []
  }
}

// Modificar a função getProductAdmin para retornar null quando não houver produto
export async function getProductAdmin(id: string) {
  try {
    const db = getAdminDb()
    // Se o db não estiver disponível, retornar dados mock
    if (!db) {
      return null
    }

    const productRef = db.collection("products").doc(id)
    const productSnap = await productRef.get()

    if (!productSnap) {
      console.error("Invalid product snapshot")
      return null
    }

    if (productSnap.exists) {
      return convertFirestoreProduct(productSnap.id, productSnap.data())
    }

    return null
  } catch (error) {
    console.error("Error getting product with admin:", error)
    return null
  }
}

// Criar backup de todos os produtos
export async function createBackupAdmin() {
  try {
    const db = getAdminDb()
    if (!db) {
      throw new Error("Firebase Admin não está disponível")
    }

    // Obter todos os produtos
    const products = await getAllProductsAdmin()

    // Criar um documento de backup com timestamp
    const backupDate = new Date()
    const backupId = `backup_${backupDate.toISOString().split("T")[0]}_${Date.now()}`

    // Sanitizar os dados antes de salvar
    const sanitizedProducts = products.map((product) => {
      // Converter datas para objetos Firestore Timestamp
      const { getFirestore } = require("firebase-admin/firestore")
      const Timestamp = getFirestore().Timestamp

      return {
        ...product,
        createdAt: Timestamp.fromDate(new Date(product.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(product.updatedAt)),
        promotion: product.promotion
          ? {
              ...product.promotion,
              endDate: product.promotion.endDate ? Timestamp.fromDate(new Date(product.promotion.endDate)) : null,
            }
          : null,
      }
    })

    const backupRef = db.collection("backups").doc(backupId)
    await backupRef.set({
      timestamp: new Date(),
      date: backupDate.toISOString().split("T")[0],
      products: sanitizedProducts,
    })

    return backupId
  } catch (error) {
    console.error("Error creating backup:", error)
    throw error
  }
}
