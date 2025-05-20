import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"
import { db } from "./firebase-config"
import { updateProductStock } from "./firebase"
import type { CartItem } from "@/components/floating-cart"

export type OrderStatus = "aguardando_confirmacao" | "confirmada" | "cancelada"

export interface Order {
  id: string
  items: CartItem[]
  customerName: string
  customerPhone: string
  customerAddress?: string
  deliveryOption: string
  deliveryFee: number
  total: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
  notes?: string
}

// Converter dados do Firestore para o tipo Order
function convertFirestoreOrder(id: string, data: any): Order {
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
      }
    }

    if (data.updatedAt) {
      if (data.updatedAt instanceof Date) {
        updatedAt = data.updatedAt
      } else if (data.updatedAt.toDate && typeof data.updatedAt.toDate === "function") {
        updatedAt = data.updatedAt.toDate()
      } else if (data.updatedAt._seconds) {
        updatedAt = new Date(data.updatedAt._seconds * 1000)
      }
    }
  } catch (error) {
    console.error("Erro ao processar datas:", error)
  }

  return {
    id,
    items: Array.isArray(data.items) ? data.items : [],
    customerName: data.customerName || "",
    customerPhone: data.customerPhone || "",
    customerAddress: data.customerAddress || "",
    deliveryOption: data.deliveryOption || "retirada",
    deliveryFee: typeof data.deliveryFee === "number" ? data.deliveryFee : 0,
    total: typeof data.total === "number" ? data.total : 0,
    status: data.status || "aguardando_confirmacao",
    createdAt,
    updatedAt,
    notes: data.notes || "",
  }
}

// Adicionar um novo pedido
export async function addOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
  try {
    const ordersRef = collection(db, "orders")
    const newOrderRef = doc(ordersRef)

    const firestoreData = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(newOrderRef, firestoreData)
    console.log(`Pedido criado com ID: ${newOrderRef.id}`)
    return newOrderRef.id
  } catch (error) {
    console.error("Erro ao adicionar pedido:", error)
    throw error
  }
}

// Obter um pedido específico
export async function getOrder(id: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, "orders", id)
    const orderSnap = await getDoc(orderRef)

    if (orderSnap.exists()) {
      return convertFirestoreOrder(orderSnap.id, orderSnap.data())
    }

    return null
  } catch (error) {
    console.error("Erro ao obter pedido:", error)
    throw error
  }
}

// Obter todos os pedidos
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, orderBy("createdAt", "desc"))
    const ordersSnap = await getDocs(q)

    const orders: Order[] = []
    ordersSnap.forEach((doc) => {
      orders.push(convertFirestoreOrder(doc.id, doc.data()))
    })

    return orders
  } catch (error) {
    console.error("Erro ao obter todos os pedidos:", error)
    throw error
  }
}

// Obter pedidos por status
export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("status", "==", status), orderBy("createdAt", "desc"))
    const ordersSnap = await getDocs(q)

    const orders: Order[] = []
    ordersSnap.forEach((doc) => {
      orders.push(convertFirestoreOrder(doc.id, doc.data()))
    })

    return orders
  } catch (error) {
    console.error(`Erro ao obter pedidos com status ${status}:`, error)
    throw error
  }
}

// Atualizar o status de um pedido
export async function updateOrderStatus(id: string, status: OrderStatus, updateStock = false): Promise<void> {
  try {
    const orderRef = doc(db, "orders", id)

    // Obter o pedido atual para verificar se o status está mudando para "confirmada"
    const orderSnap = await getDoc(orderRef)
    if (!orderSnap.exists()) {
      throw new Error(`Pedido não encontrado com ID: ${id}`)
    }

    const currentOrder = convertFirestoreOrder(id, orderSnap.data())

    // Atualizar o status do pedido
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    })

    // Se o pedido está sendo confirmado e updateStock é true, atualizar o estoque
    if (updateStock && status === "confirmada" && currentOrder.status !== "confirmada") {
      console.log(`Atualizando estoque para o pedido ${id}`)

      // Atualizar o estoque de cada item do pedido
      for (const item of currentOrder.items) {
        if (item.id && item.quantity) {
          try {
            await updateProductStock(item.id, item.quantity)
          } catch (error) {
            console.error(`Erro ao atualizar estoque do produto ${item.id}:`, error)
          }
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao atualizar status do pedido ${id}:`, error)
    throw error
  }
}

// Atualizar um pedido
export async function updateOrder(id: string, orderData: Partial<Order>): Promise<void> {
  try {
    const orderRef = doc(db, "orders", id)

    // Remover campos que não devem ser atualizados diretamente
    const { id: _, createdAt, updatedAt, ...updateData } = orderData as any

    await updateDoc(orderRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error(`Erro ao atualizar pedido ${id}:`, error)
    throw error
  }
}

// Excluir um pedido
export async function deleteOrder(id: string): Promise<void> {
  try {
    console.log(`Excluindo pedido com ID: ${id}`)
    const orderRef = doc(db, "orders", id)

    // Verificar se o pedido existe antes de excluir
    const orderSnap = await getDoc(orderRef)
    if (!orderSnap.exists()) {
      throw new Error(`Pedido não encontrado com ID: ${id}`)
    }

    await deleteDoc(orderRef)
    console.log(`Pedido ${id} excluído com sucesso`)
  } catch (error) {
    console.error(`Erro ao excluir pedido ${id}:`, error)
    throw error
  }
}

// Confirmar um pedido
export async function confirmOrder(id: string): Promise<void> {
  try {
    console.log(`Confirmando pedido com ID: ${id}`)

    // Obter o pedido atual
    const order = await getOrder(id)
    if (!order) {
      throw new Error(`Pedido não encontrado com ID: ${id}`)
    }

    // Verificar se o pedido já está confirmado
    if (order.status === "confirmada") {
      console.log(`Pedido ${id} já está confirmado`)
      return
    }

    // Atualizar o status do pedido para "confirmada"
    await updateOrderStatus(id, "confirmada", true)

    console.log(`Pedido ${id} confirmado com sucesso e estoque atualizado`)
  } catch (error) {
    console.error(`Erro ao confirmar pedido ${id}:`, error)
    throw error
  }
}
