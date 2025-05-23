import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  orderBy,
  updateDoc,
  increment,
} from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import type { Product, ProductFormData } from "@/types/product"
import { db, storage } from "./firebase-config"
import { getCurrentUser } from "./firebase-auth"

// Storage helpers
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progresso do upload
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log(`Upload is ${progress}% done`)
        },
        (error) => {
          // Erro no upload
          console.error("Error uploading image:", error)

          // Mensagens de erro mais específicas
          if (error.code === "storage/unauthorized") {
            reject(
              new Error(
                "Permissão negada para fazer upload de imagens. Verifique se você está logado e tem permissões suficientes.",
              ),
            )
          } else if (error.code === "storage/canceled") {
            reject(new Error("Upload cancelado."))
          } else if (error.code === "storage/unknown") {
            reject(new Error("Ocorreu um erro desconhecido durante o upload."))
          } else {
            reject(error)
          }
        },
        async () => {
          // Upload completo
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            resolve(downloadURL)
          } catch (error) {
            console.error("Error getting download URL:", error)
            reject(new Error("Erro ao obter URL da imagem após upload."))
          }
        },
      )
    })
  } catch (error) {
    console.error("Error in uploadImage:", error)
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error("Erro desconhecido ao fazer upload da imagem.")
    }
  }
}

export async function deleteImage(url: string): Promise<void> {
  try {
    // Extrair o caminho do storage da URL
    const decodedUrl = decodeURIComponent(url)
    const startIndex = decodedUrl.indexOf("/o/") + 3
    const endIndex = decodedUrl.indexOf("?")
    const storagePath = decodedUrl.substring(startIndex, endIndex)

    const storageRef = ref(storage, storagePath)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting image:", error)
    throw error
  }
}

// Helper function to sanitize data before sending to Firestore
export function sanitizeData(data: any): any {
  if (data === null || data === undefined) {
    return null
  }

  if (typeof data === "object" && data !== null) {
    if (data instanceof Date) {
      return Timestamp.fromDate(data)
    }

    if (Array.isArray(data)) {
      return data.map((item) => sanitizeData(item))
    }

    const sanitizedData: Record<string, any> = {}

    for (const [key, value] of Object.entries(data)) {
      // Skip undefined values
      if (value !== undefined) {
        sanitizedData[key] = sanitizeData(value)
      }
    }

    return sanitizedData
  }

  return data
}

// Convert Firestore data to our Product type
export function convertFirestoreProduct(id: string, data: any): Product {
  // Verificar se data é um objeto válido
  if (!data || typeof data !== "object") {
    console.warn("Dados inválidos recebidos em convertFirestoreProduct:", data)
    return {
      id,
      name: "",
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

  // Processar datas com segurança
  let createdAt = new Date()
  let updatedAt = new Date()

  try {
    if (data.createdAt) {
      if (data.createdAt instanceof Date) {
        createdAt = data.createdAt
      } else if (data.createdAt.toDate && typeof data.createdAt.toDate === "function") {
        createdAt = data.createdAt.toDate()
      } else if (data.createdAt._seconds) {
        createdAt = new Date(data.createdAt._seconds * 1000)
      } else if (typeof data.createdAt === "string") {
        createdAt = new Date(data.createdAt)
      }
    }

    if (data.updatedAt) {
      if (data.updatedAt instanceof Date) {
        updatedAt = data.updatedAt
      } else if (data.updatedAt.toDate && typeof data.updatedAt.toDate === "function") {
        updatedAt = data.updatedAt.toDate()
      } else if (data.updatedAt._seconds) {
        updatedAt = new Date(data.updatedAt._seconds * 1000)
      } else if (typeof data.updatedAt === "string") {
        updatedAt = new Date(data.updatedAt)
      }
    }
  } catch (error) {
    console.error("Erro ao processar datas:", error)
  }

  // Processar promoção com segurança
  let promotion = null
  if (data.promotion && typeof data.promotion === "object") {
    let endDate = null
    try {
      if (data.promotion.endDate) {
        if (data.promotion.endDate instanceof Date) {
          endDate = data.promotion.endDate
        } else if (data.promotion.endDate.toDate && typeof data.promotion.endDate.toDate === "function") {
          endDate = data.promotion.endDate.toDate()
        } else if (data.promotion.endDate._seconds) {
          endDate = new Date(data.promotion.endDate._seconds * 1000)
        } else if (typeof data.promotion.endDate === "string") {
          endDate = new Date(data.promotion.endDate)
        }
      }
    } catch (error) {
      console.error("Erro ao processar data de promoção:", error)
    }

    promotion = {
      active: Boolean(data.promotion.active),
      endDate,
      discountPercentage: typeof data.promotion.discountPercentage === "number" ? data.promotion.discountPercentage : 0,
      badge: typeof data.promotion.badge === "string" ? data.promotion.badge : null,
      type: typeof data.promotion.type === "string" ? data.promotion.type : null,
    }
  }

  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    originalPrice: typeof data.originalPrice === "number" ? data.originalPrice : 0,
    currentPrice: typeof data.currentPrice === "number" ? data.currentPrice : 0,
    description: typeof data.description === "string" ? data.description : "",
    images: Array.isArray(data.images) ? data.images : [],
    category: typeof data.category === "string" ? data.category : "",
    features: Array.isArray(data.features) ? data.features : [],
    stock: typeof data.stock === "number" ? data.stock : 0,
    promotion,
    createdAt,
    updatedAt,
  }
}

// Convert form data to Firestore data
export function convertFormToFirestore(formData: ProductFormData): any {
  const productData: any = {
    name: formData.name,
    originalPrice: Number(formData.originalPrice),
    currentPrice: Number(formData.currentPrice),
    description: formData.description || "",
    images: formData.images || [],
    category: formData.category,
    features: formData.features || [],
    stock: Number(formData.stock),
    updatedAt: serverTimestamp(),
  }

  // Only add promotion if it's active
  if (formData.promotion && formData.promotion.active) {
    productData.promotion = {
      active: true,
      discountPercentage: Number(formData.promotion.discountPercentage) || 0,
    }

    // Only add endDate if it exists
    if (formData.promotion.endDate) {
      productData.promotion.endDate = Timestamp.fromDate(new Date(formData.promotion.endDate))
    }

    // Only add badge if it exists
    if (formData.promotion.badge) {
      productData.promotion.badge = formData.promotion.badge
    }

    // Only add type if it exists
    if (formData.promotion.type) {
      productData.promotion.type = formData.promotion.type
    }
  } else {
    // If promotion is not active, set it to null
    productData.promotion = null
  }

  return sanitizeData(productData)
}

// Check if user is authenticated before performing operations
const ensureAuthenticated = () => {
  const user = getCurrentUser()
  if (!user) {
    console.error("Operação rejeitada: Usuário não autenticado")
    throw new Error("User not authenticated")
  }
  return user
}

// Product CRUD operations
export async function addProduct(productData: ProductFormData): Promise<string> {
  try {
    // Verificar autenticação
    ensureAuthenticated()

    const productsRef = collection(db, "products")
    const newProductRef = doc(productsRef)

    const firestoreData = convertFormToFirestore(productData)
    firestoreData.createdAt = serverTimestamp()

    // Adicionar log para depuração
    console.log("Adicionando produto:", firestoreData)

    // Usar set em vez de setDoc para maior compatibilidade
    await setDoc(newProductRef, firestoreData)
    return newProductRef.id
  } catch (error) {
    console.error("Error adding product:", error)
    // Adicionar mais detalhes ao erro para facilitar a depuração
    if (error instanceof Error) {
      throw new Error(`Erro ao adicionar produto: ${error.message}`)
    }
    throw error
  }
}

export async function updateProduct(id: string, productData: ProductFormData): Promise<void> {
  try {
    ensureAuthenticated()
    const productRef = doc(db, "products", id)
    const firestoreData = convertFormToFirestore(productData)

    await setDoc(productRef, firestoreData, { merge: true })
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

// Nova função para atualizar o estoque de um produto
export async function updateProductStock(productId: string, quantity: number): Promise<void> {
  try {
    console.log(`Atualizando estoque do produto ${productId} em ${quantity} unidades`)

    // Verificar se o ID do produto é válido
    if (!productId || typeof productId !== "string") {
      throw new Error(`ID de produto inválido: ${productId}`)
    }

    const productRef = doc(db, "products", productId)

    // Verificar se o produto existe
    const productSnap = await getDoc(productRef)
    if (!productSnap.exists()) {
      throw new Error(`Produto não encontrado com ID: ${productId}`)
    }

    // Atualizar o estoque usando increment para evitar condições de corrida
    await updateDoc(productRef, {
      stock: increment(-quantity), // Decrementa o estoque pela quantidade vendida
      updatedAt: serverTimestamp(),
    })

    console.log(`Estoque do produto ${productId} atualizado com sucesso`)
  } catch (error) {
    console.error(`Erro ao atualizar estoque do produto ${productId}:`, error)
    throw error
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const productRef = doc(db, "products", id)
    const productSnap = await getDoc(productRef)

    if (productSnap.exists()) {
      return convertFirestoreProduct(productSnap.id, productSnap.data())
    }

    return null
  } catch (error) {
    console.error("Error getting product:", error)
    throw error
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products")
    const q = query(productsRef, orderBy("createdAt", "desc"))
    const productsSnap = await getDocs(q)

    const products: Product[] = []
    productsSnap.forEach((doc) => {
      products.push(convertFirestoreProduct(doc.id, doc.data()))
    })

    return products
  } catch (error) {
    console.error("Error getting all products:", error)
    throw error
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products")
    const q = query(productsRef, where("category", "==", category), orderBy("createdAt", "desc"))
    const productsSnap = await getDocs(q)

    const products: Product[] = []
    productsSnap.forEach((doc) => {
      products.push(convertFirestoreProduct(doc.id, doc.data()))
    })

    return products
  } catch (error) {
    console.error("Error getting products by category:", error)
    throw error
  }
}

export async function getPromotedProducts(limit = 8): Promise<Product[]> {
  try {
    const productsRef = collection(db, "products")
    const q = query(productsRef, where("promotion.active", "==", true), orderBy("createdAt", "desc"))
    const productsSnap = await getDocs(q)

    const products: Product[] = []
    productsSnap.forEach((doc) => {
      products.push(convertFirestoreProduct(doc.id, doc.data()))
    })

    // Return only the requested number of products
    return products.slice(0, limit)
  } catch (error) {
    console.error("Error getting promoted products:", error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    ensureAuthenticated()
    const productRef = doc(db, "products", id)
    await deleteDoc(productRef)
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// Backup function
export async function createBackup() {
  try {
    ensureAuthenticated()

    // Obter todos os produtos
    const products = await getAllProducts()

    // Criar um documento de backup com timestamp
    const backupDate = new Date()
    const backupId = `backup_${backupDate.toISOString().split("T")[0]}_${Date.now()}`

    const backupRef = doc(db, "backups", backupId)
    await setDoc(backupRef, {
      timestamp: serverTimestamp(),
      products: products.map((product) => ({
        ...product,
        createdAt: Timestamp.fromDate(product.createdAt),
        updatedAt: Timestamp.fromDate(product.updatedAt),
        promotion: product.promotion
          ? {
              ...product.promotion,
              endDate: product.promotion.endDate ? Timestamp.fromDate(product.promotion.endDate) : null,
            }
          : null,
      })),
    })

    return backupId
  } catch (error) {
    console.error("Error creating backup:", error)
    throw error
  }
}

// Scheduled backup (to be called by a cron job or similar)
export async function scheduleBackup() {
  try {
    // Verifica se já existe um backup para hoje
    const today = new Date().toISOString().split("T")[0]
    const backupsRef = collection(db, "backups")
    const q = query(backupsRef, where("date", "==", today))
    const backupsSnap = await getDocs(q)

    if (backupsSnap.empty) {
      // Não existe backup para hoje, criar um
      const backupId = await createBackup()
      console.log(`Backup created with ID: ${backupId}`)
      return backupId
    } else {
      console.log("Backup for today already exists")
      return null
    }
  } catch (error) {
    console.error("Error scheduling backup:", error)
    throw error
  }
}
