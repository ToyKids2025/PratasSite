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
  return {
    id,
    name: data.name || "",
    originalPrice: data.originalPrice || 0,
    currentPrice: data.currentPrice || 0,
    description: data.description || "",
    images: data.images || [],
    category: data.category || "",
    features: data.features || [],
    stock: data.stock || 0,
    promotion: data.promotion
      ? {
          active: data.promotion.active || false,
          endDate: data.promotion.endDate ? data.promotion.endDate.toDate() : null,
          discountPercentage: data.promotion.discountPercentage || 0,
          badge: data.promotion.badge || null,
          type: data.promotion.type || null,
        }
      : null,
    createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
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
