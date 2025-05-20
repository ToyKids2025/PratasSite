/**
 * Este módulo substitui o SDK do Firebase por chamadas REST API diretas
 * Evita completamente o uso do SDK do Firebase e, portanto, evita o problema com o google-logging-utils
 */

// Tipos básicos
type FirestoreDocument = {
  id: string
  [key: string]: any
}

type FirestoreCollection = {
  documents: FirestoreDocument[]
}

// Configuração
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

// Função para converter um documento do formato Firestore REST para um objeto simples
function convertFromFirestoreRest(doc: any): FirestoreDocument {
  if (!doc || !doc.fields) {
    return { id: doc.name?.split("/").pop() || "unknown" }
  }

  const result: any = {
    id: doc.name?.split("/").pop() || "unknown",
  }

  // Converter campos
  Object.entries(doc.fields).forEach(([key, value]: [string, any]) => {
    result[key] = extractValue(value)
  })

  return result
}

// Função para extrair o valor de um campo do Firestore
function extractValue(fieldValue: any): any {
  if (!fieldValue) return null

  // Determinar o tipo de campo
  const fieldType = Object.keys(fieldValue)[0]
  const rawValue = fieldValue[fieldType]

  switch (fieldType) {
    case "stringValue":
      return rawValue
    case "integerValue":
      return Number.parseInt(rawValue, 10)
    case "doubleValue":
      return Number.parseFloat(rawValue)
    case "booleanValue":
      return rawValue
    case "nullValue":
      return null
    case "timestampValue":
      return new Date(rawValue)
    case "arrayValue":
      if (!rawValue.values) return []
      return rawValue.values.map((v: any) => extractValue(v))
    case "mapValue":
      if (!rawValue.fields) return {}
      const result: any = {}
      Object.entries(rawValue.fields).forEach(([key, value]: [string, any]) => {
        result[key] = extractValue(value)
      })
      return result
    case "geoPointValue":
      return {
        latitude: rawValue.latitude,
        longitude: rawValue.longitude,
      }
    case "referenceValue":
      return rawValue.split("/").pop()
    default:
      return rawValue
  }
}

// Função para converter um valor para o formato Firestore REST
function convertToFirestoreValue(value: any): any {
  if (value === null || value === undefined) {
    return { nullValue: null }
  }

  if (typeof value === "string") {
    return { stringValue: value }
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { integerValue: value.toString() }
    }
    return { doubleValue: value }
  }

  if (typeof value === "boolean") {
    return { booleanValue: value }
  }

  if (value instanceof Date) {
    return { timestampValue: value.toISOString() }
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => convertToFirestoreValue(item)),
      },
    }
  }

  if (typeof value === "object") {
    const fields: any = {}
    Object.entries(value).forEach(([key, val]) => {
      fields[key] = convertToFirestoreValue(val)
    })
    return { mapValue: { fields } }
  }

  // Fallback
  return { stringValue: String(value) }
}

// Função para converter um objeto para o formato Firestore REST
function convertToFirestoreRest(data: any): any {
  const fields: any = {}

  Object.entries(data).forEach(([key, value]) => {
    fields[key] = convertToFirestoreValue(value)
  })

  return { fields }
}

// Função para obter um token de autenticação (se necessário)
async function getAuthToken(): Promise<string | null> {
  // Se você tiver autenticação, implemente aqui
  // Por enquanto, retornamos null para usar apenas a API_KEY
  return null
}

// Função para construir a URL com parâmetros de autenticação
async function buildUrl(path: string): Promise<string> {
  const authToken = await getAuthToken()
  const authParam = authToken ? `&auth=${authToken}` : ""
  return `${BASE_URL}${path}?key=${API_KEY}${authParam}`
}

// Função para obter todos os documentos de uma coleção
export async function getAllDocuments(collection: string): Promise<FirestoreDocument[]> {
  try {
    const url = await buildUrl(`/${collection}`)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Error fetching documents: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.documents) {
      return []
    }

    return data.documents.map(convertFromFirestoreRest)
  } catch (error) {
    console.error(`Error in getAllDocuments(${collection}):`, error)
    return []
  }
}

// Função para obter um documento específico
export async function getDocument(collection: string, id: string): Promise<FirestoreDocument | null> {
  try {
    const url = await buildUrl(`/${collection}/${id}`)
    const response = await fetch(url)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Error fetching document: ${response.statusText}`)
    }

    const data = await response.json()
    return convertFromFirestoreRest(data)
  } catch (error) {
    console.error(`Error in getDocument(${collection}, ${id}):`, error)
    return null
  }
}

// Função para criar um documento
export async function createDocument(collection: string, data: any): Promise<FirestoreDocument | null> {
  try {
    const url = await buildUrl(`/${collection}`)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(convertToFirestoreRest(data)),
    })

    if (!response.ok) {
      throw new Error(`Error creating document: ${response.statusText}`)
    }

    const responseData = await response.json()
    return convertFromFirestoreRest(responseData)
  } catch (error) {
    console.error(`Error in createDocument(${collection}):`, error)
    return null
  }
}

// Função para atualizar um documento
export async function updateDocument(collection: string, id: string, data: any): Promise<FirestoreDocument | null> {
  try {
    const url = await buildUrl(`/${collection}/${id}`)
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(convertToFirestoreRest(data)),
    })

    if (!response.ok) {
      throw new Error(`Error updating document: ${response.statusText}`)
    }

    const responseData = await response.json()
    return convertFromFirestoreRest(responseData)
  } catch (error) {
    console.error(`Error in updateDocument(${collection}, ${id}):`, error)
    return null
  }
}

// Função para excluir um documento
export async function deleteDocument(collection: string, id: string): Promise<boolean> {
  try {
    const url = await buildUrl(`/${collection}/${id}`)
    const response = await fetch(url, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Error deleting document: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error(`Error in deleteDocument(${collection}, ${id}):`, error)
    return false
  }
}

// Função para obter produtos
export async function getProducts(): Promise<FirestoreDocument[]> {
  return getAllDocuments("products")
}

// Função para obter um produto específico
export async function getProduct(id: string): Promise<FirestoreDocument | null> {
  return getDocument("products", id)
}

// Função para obter produtos em promoção
export async function getPromotedProducts(): Promise<FirestoreDocument[]> {
  const products = await getProducts()
  return products.filter((product) => product.promotion?.active === true)
}

// Exportar funções específicas para produtos
export const productsAPI = {
  getAll: getProducts,
  getById: getProduct,
  getPromoted: getPromotedProducts,
}

// Exportar funções genéricas
export const firestoreAPI = {
  getAll: getAllDocuments,
  getById: getDocument,
  create: createDocument,
  update: updateDocument,
  delete: deleteDocument,
}
