import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase-config"
import { updateProduct, getProduct } from "./firebase"

// Tipo para os pedidos
export interface Order {
  id: string
  customer: string
  date: Date | Timestamp
  items: {
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }[]
  paymentMethod: string
  deliveryMethod: string
  status: "aguardando_pagamento" | "pagamento_aprovado" | "separando" | "enviado" | "entregue" | "cancelado"
  total: number
  deliveryFee: number
  finalTotal: number
}

// Converter dados para o Firestore
function convertOrderToFirestore(order: Order): any {
  return {
    id: order.id,
    customer: order.customer,
    date: order.date instanceof Date ? Timestamp.fromDate(order.date) : order.date,
    items: order.items,
    paymentMethod: order.paymentMethod,
    deliveryMethod: order.deliveryMethod,
    status: order.status,
    total: order.total,
    deliveryFee: order.deliveryFee,
    finalTotal: order.finalTotal,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

// Converter dados do Firestore
function convertFirestoreToOrder(data: any): Order {
  return {
    id: data.id,
    customer: data.customer,
    date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
    items: data.items || [],
    paymentMethod: data.paymentMethod,
    deliveryMethod: data.deliveryMethod,
    status: data.status,
    total: data.total,
    deliveryFee: data.deliveryFee,
    finalTotal: data.finalTotal,
  }
}

// Adicionar um novo pedido
export async function addOrder(order: Order): Promise<string> {
  try {
    const ordersRef = collection(db, "orders")
    const orderRef = doc(ordersRef, order.id)

    const firestoreData = convertOrderToFirestore(order)
    await setDoc(orderRef, firestoreData)

    return order.id
  } catch (error) {
    console.error("Erro ao adicionar pedido:", error)
    throw error
  }
}

// Obter um pedido pelo ID
export async function getOrder(id: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, "orders", id)
    const orderSnap = await getDoc(orderRef)

    if (orderSnap.exists()) {
      return convertFirestoreToOrder(orderSnap.data())
    }

    return null
  } catch (error) {
    console.error("Erro ao buscar pedido:", error)
    throw error
  }
}

// Obter todos os pedidos
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, orderBy("date", "desc"))
    const ordersSnap = await getDocs(q)

    const orders: Order[] = []
    ordersSnap.forEach((doc) => {
      orders.push(convertFirestoreToOrder(doc.data()))
    })

    return orders
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error)
    throw error
  }
}

// Obter pedidos por status
export async function getOrdersByStatus(status: Order["status"]): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("status", "==", status), orderBy("date", "desc"))
    const ordersSnap = await getDocs(q)

    const orders: Order[] = []
    ordersSnap.forEach((doc) => {
      orders.push(convertFirestoreToOrder(doc.data()))
    })

    return orders
  } catch (error) {
    console.error("Erro ao buscar pedidos por status:", error)
    throw error
  }
}

// Atualizar status do pedido
export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  try {
    const orderRef = doc(db, "orders", id)
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    throw error
  }
}

// Atualizar pedido
export async function updateOrder(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, "orders", order.id)
    const firestoreData = convertOrderToFirestore(order)

    // Não sobrescrever createdAt
    delete firestoreData.createdAt

    await updateDoc(orderRef, {
      ...firestoreData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error)
    throw error
  }
}

// Confirmar pedido e baixar estoque
export async function confirmOrder(id: string): Promise<void> {
  try {
    // Obter o pedido
    const order = await getOrder(id)
    if (!order) {
      throw new Error("Pedido não encontrado")
    }

    // Atualizar status do pedido
    await updateOrderStatus(id, "pagamento_aprovado")

    // Baixar estoque para cada item
    for (const item of order.items) {
      const product = await getProduct(item.id)
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity)
        await updateProduct(item.id, {
          ...product,
          stock: newStock,
        })
      }
    }
  } catch (error) {
    console.error("Erro ao confirmar pedido:", error)
    throw error
  }
}
