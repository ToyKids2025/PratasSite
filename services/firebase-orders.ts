import { db } from "./firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

// Tipos para pedidos
export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface Order {
  id?: string
  customerName: string
  customerEmail?: string
  customerPhone: string
  items: OrderItem[]
  total: number
  status: "aguardando_pagamento" | "pagamento_aprovado" | "separando" | "enviado" | "entregue" | "cancelado"
  paymentMethod?: string
  shippingAddress?: string
  createdAt: Date
  updatedAt: Date
  notes?: string
}

// Função para adicionar um novo pedido
export async function addOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) {
  try {
    if (!db) {
      console.error("Firebase Admin não está inicializado")
      return null
    }

    const now = new Date()

    const orderToSave = {
      ...orderData,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    }

    const orderRef = await db.collection("orders").add(orderToSave)

    return {
      id: orderRef.id,
      ...orderData,
      createdAt: now,
      updatedAt: now,
    }
  } catch (error) {
    console.error("Erro ao adicionar pedido:", error)
    return null
  }
}

// Função para confirmar um pedido
export async function confirmOrder(orderId: string) {
  try {
    if (!db) {
      console.error("Firebase Admin não está inicializado")
      return false
    }

    const orderRef = db.collection("orders").doc(orderId)
    const orderDoc = await orderRef.get()

    if (!orderDoc.exists) {
      console.error("Pedido não encontrado:", orderId)
      return false
    }

    // Atualizar o status do pedido para "pagamento_aprovado"
    await orderRef.update({
      status: "pagamento_aprovado",
      updatedAt: Timestamp.fromDate(new Date()),
    })

    // Atualizar o estoque dos produtos
    const orderData = orderDoc.data()
    if (orderData && orderData.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        if (item.productId && item.quantity) {
          const productRef = db.collection("products").doc(item.productId)
          const productDoc = await productRef.get()

          if (productDoc.exists) {
            const productData = productDoc.data()
            if (productData && typeof productData.stock === "number") {
              const newStock = Math.max(0, productData.stock - item.quantity)
              await productRef.update({
                stock: newStock,
                updatedAt: Timestamp.fromDate(new Date()),
              })
            }
          }
        }
      }
    }

    return true
  } catch (error) {
    console.error("Erro ao confirmar pedido:", error)
    return false
  }
}

// Função para obter todos os pedidos
export async function getAllOrders() {
  try {
    if (!db) {
      console.error("Firebase Admin não está inicializado")
      return []
    }

    const ordersRef = db.collection("orders")
    const snapshot = await ordersRef.orderBy("createdAt", "desc").get()

    const orders: Order[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()

      orders.push({
        id: doc.id,
        customerName: data.customerName || "",
        customerEmail: data.customerEmail || "",
        customerPhone: data.customerPhone || "",
        items: data.items || [],
        total: data.total || 0,
        status: data.status || "aguardando_pagamento",
        paymentMethod: data.paymentMethod || "",
        shippingAddress: data.shippingAddress || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        notes: data.notes || "",
      })
    })

    return orders
  } catch (error) {
    console.error("Erro ao obter pedidos:", error)
    return []
  }
}

// Função para obter pedidos por status
export async function getOrdersByStatus(status: Order["status"]) {
  try {
    if (!db) {
      console.error("Firebase Admin não está inicializado")
      return []
    }

    const ordersRef = db.collection("orders")
    const snapshot = await ordersRef.where("status", "==", status).orderBy("createdAt", "desc").get()

    const orders: Order[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()

      orders.push({
        id: doc.id,
        customerName: data.customerName || "",
        customerEmail: data.customerEmail || "",
        customerPhone: data.customerPhone || "",
        items: data.items || [],
        total: data.total || 0,
        status: data.status || "aguardando_pagamento",
        paymentMethod: data.paymentMethod || "",
        shippingAddress: data.shippingAddress || "",
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        notes: data.notes || "",
      })
    })

    return orders
  } catch (error) {
    console.error("Erro ao obter pedidos por status:", error)
    return []
  }
}

// Função para obter um pedido específico
export async function getOrderById(id: string) {
  try {
    if (!db) {
      console.error("Firebase Admin não está inicializado")
      return null
    }

    const orderRef = db.collection("orders").doc(id)
    const doc = await orderRef.get()

    if (!doc.exists) {
      return null
    }

    const data = doc.data()

    return {
      id: doc.id,
      customerName: data?.customerName || "",
      customerEmail: data?.customerEmail || "",
      customerPhone: data?.customerPhone || "",
      items: data?.items || [],
      total: data?.total || 0,
      status: data?.status || "aguardando_pagamento",
      paymentMethod: data?.paymentMethod || "",
      shippingAddress: data?.shippingAddress || "",
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      notes: data?.notes || "",
    }
  } catch (error) {
    console.error("Erro ao obter pedido:", error)
    return null
  }
}

// Função para atualizar um pedido
export async function updateOrder(id: string, orderData: Partial<Order>) {
  try {
    if (!db) {
      console.error("Firebase Admin não está inicializado")
      return false
    }

    const orderRef = db.collection("orders").doc(id)

    // Remover campos que não devem ser atualizados diretamente
    const { id: _, createdAt, ...dataToUpdate } = orderData

    // Adicionar timestamp de atualização
    const updateData = {
      ...dataToUpdate,
      updatedAt: Timestamp.fromDate(new Date()),
    }

    await orderRef.update(updateData)

    return true
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error)
    return false
  }
}

// Função para atualizar o status de um pedido
export async function updateOrderStatus(id: string, status: Order["status"]) {
  try {
    if (!db) {
      console.error("Firebase Admin não está inicializado")
      return false
    }

    const orderRef = db.collection("orders").doc(id)

    await orderRef.update({
      status,
      updatedAt: Timestamp.fromDate(new Date()),
    })

    return true
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error)
    return false
  }
}

// Função para excluir um pedido
export async function deleteOrder(id: string) {
  try {
    if (!db) {
      console.error("Firebase Admin não está inicializado")
      return false
    }

    const orderRef = db.collection("orders").doc(id)
    await orderRef.delete()

    return true
  } catch (error) {
    console.error("Erro ao excluir pedido:", error)
    return false
  }
}

// Função para atualizar o estoque após confirmação de pedido
export async function updateProductStockAfterOrder(orderId: string) {
  try {
    if (!db) {
      console.error("Firebase Admin não está inicializado")
      return false
    }

    // Obter o pedido
    const order = await getOrderById(orderId)
    if (!order) {
      console.error("Pedido não encontrado")
      return false
    }

    // Iniciar uma transação para atualizar o estoque de forma segura
    await db.runTransaction(async (transaction) => {
      // Para cada item no pedido
      for (const item of order.items) {
        const productRef = db.collection("products").doc(item.productId)
        const productDoc = await transaction.get(productRef)

        if (!productDoc.exists) {
          console.warn(`Produto ${item.productId} não encontrado`)
          continue
        }

        const productData = productDoc.data()
        const currentStock = productData?.stock || 0

        // Verificar se há estoque suficiente
        if (currentStock < item.quantity) {
          console.warn(`Estoque insuficiente para o produto ${item.productId}`)
          continue
        }

        // Atualizar o estoque
        transaction.update(productRef, {
          stock: currentStock - item.quantity,
          updatedAt: Timestamp.fromDate(new Date()),
        })
      }
    })

    // Atualizar o status do pedido para "pagamento_aprovado"
    await updateOrderStatus(orderId, "pagamento_aprovado")

    return true
  } catch (error) {
    console.error("Erro ao atualizar estoque após pedido:", error)
    return false
  }
}
