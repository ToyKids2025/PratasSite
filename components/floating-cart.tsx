"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { ShoppingCart, X, Plus, Minus, ArrowRight, CreditCard, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { addOrder } from "@/services/firebase-orders"
import { useNotification } from "@/components/notification"

// Tipo para os itens do carrinho
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

// Tipo para os dados do pedido
export interface OrderData {
  customerName: string
  paymentMethod: "pix" | "credit" | "debit" | "cash" | ""
  deliveryMethod: "pickup" | "local" | ""
}

// Contexto do carrinho
interface CartContextType {
  items: CartItem[]
  orderData: OrderData
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateOrderData: (data: Partial<OrderData>) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  deliveryFee: number
  finalPrice: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  orderData: {
    customerName: "",
    paymentMethod: "",
    deliveryMethod: "",
  },
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  updateOrderData: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  deliveryFee: 0,
  finalPrice: 0,
})

// Hook para usar o carrinho
export const useCart = () => useContext(CartContext)

// Provedor do carrinho
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [orderData, setOrderData] = useState<OrderData>({
    customerName: "",
    paymentMethod: "",
    deliveryMethod: "",
  })
  const [isClient, setIsClient] = useState(false)

  // Inicializar do localStorage quando o componente montar
  useEffect(() => {
    setIsClient(true)
    const savedCart = localStorage.getItem("cart")
    const savedOrderData = localStorage.getItem("orderData")

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error)
        localStorage.removeItem("cart")
      }
    }

    if (savedOrderData) {
      try {
        setOrderData(JSON.parse(savedOrderData))
      } catch (error) {
        console.error("Erro ao carregar dados do pedido:", error)
        localStorage.removeItem("orderData")
      }
    }
  }, [])

  // Salvar no localStorage quando o carrinho mudar
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isClient])

  // Salvar dados do pedido no localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("orderData", JSON.stringify(orderData))
    }
  }, [orderData, isClient])

  // Adicionar item ao carrinho
  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        // Se o item já existe, atualizar a quantidade
        return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
      } else {
        // Se o item não existe, adicionar ao carrinho
        return [...prevItems, item]
      }
    })
  }

  // Remover item do carrinho
  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  // Atualizar quantidade de um item
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  // Atualizar dados do pedido
  const updateOrderData = (data: Partial<OrderData>) => {
    setOrderData((prev) => ({ ...prev, ...data }))
  }

  // Limpar o carrinho
  const clearCart = () => {
    setItems([])
    setOrderData({
      customerName: "",
      paymentMethod: "",
      deliveryMethod: "",
    })
  }

  // Calcular total de itens
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  // Calcular preço total dos produtos
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  // Calcular taxa de entrega
  const deliveryFee = orderData.deliveryMethod === "local" ? 10 : 0

  // Calcular preço final (produtos + entrega)
  const finalPrice = totalPrice + deliveryFee

  return (
    <CartContext.Provider
      value={{
        items,
        orderData,
        addItem,
        removeItem,
        updateQuantity,
        updateOrderData,
        clearCart,
        totalItems,
        totalPrice,
        deliveryFee,
        finalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Componente do carrinho flutuante
export function FloatingCart() {
  const {
    items,
    orderData,
    totalItems,
    totalPrice,
    deliveryFee,
    finalPrice,
    updateQuantity,
    removeItem,
    updateOrderData,
    clearCart,
  } = useCart()
  const { showNotification } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [formErrors, setFormErrors] = useState({
    customerName: false,
    paymentMethod: false,
    deliveryMethod: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Formatar preço
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",")
  }

  // Validar formulário
  const validateForm = () => {
    const errors = {
      customerName: !orderData.customerName,
      paymentMethod: !orderData.paymentMethod,
      deliveryMethod: !orderData.deliveryMethod,
    }

    setFormErrors(errors)
    return !Object.values(errors).some((error) => error)
  }

  // Gerar mensagem para WhatsApp
  const generateWhatsAppMessage = () => {
    if (items.length === 0) return ""

    // Número da loja atualizado
    const storePhone = "554996824477"

    // Gerar ID do pedido baseado no nome do cliente e timestamp
    const orderId = `${orderData.customerName.split(" ")[0]}-${Date.now().toString().slice(-6)}`

    let message = `*NOVO PEDIDO #${orderId}*\n\n`
    message += `*Cliente:* ${orderData.customerName}\n`
    message += `*Forma de Pagamento:* ${getPaymentMethodText(orderData.paymentMethod)}\n`
    message += `*Forma de Entrega:* ${getDeliveryMethodText(orderData.deliveryMethod)}\n\n`
    message += "*ITENS DO PEDIDO:*\n"

    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} - R$ ${formatPrice(item.price * item.quantity)}\n`
      // Adicionar link da imagem
      if (item.image && item.image !== "/placeholder.svg") {
        message += `  Imagem: ${item.image}\n`
      }
    })

    message += `\n*Subtotal:* R$ ${formatPrice(totalPrice)}`

    if (deliveryFee > 0) {
      message += `\n*Taxa de entrega:* R$ ${formatPrice(deliveryFee)}`
    }

    message += `\n*Total:* R$ ${formatPrice(finalPrice)}\n\n`

    return `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`
  }

  // Obter texto da forma de pagamento
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "pix":
        return "PIX"
      case "credit":
        return "Cartão de crédito"
      case "debit":
        return "Cartão de débito"
      case "cash":
        return "Dinheiro"
      default:
        return ""
    }
  }

  // Obter texto da forma de entrega
  const getDeliveryMethodText = (method: string) => {
    switch (method) {
      case "pickup":
        return "Retirada no local"
      case "local":
        return "Entrega em Seara-SC (+R$10,00)"
      default:
        return ""
    }
  }

  // Salvar pedido no Firestore e redirecionar para WhatsApp
  const handleSubmitOrder = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (!validateForm() || items.length === 0) {
      return
    }

    try {
      setIsSubmitting(true)

      // Gerar ID do pedido
      const orderId = `${orderData.customerName.split(" ")[0]}-${Date.now().toString().slice(-6)}`

      // Preparar dados do pedido
      const orderDetails = {
        id: orderId,
        customer: orderData.customerName,
        date: new Date(),
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        paymentMethod: getPaymentMethodText(orderData.paymentMethod),
        deliveryMethod: getDeliveryMethodText(orderData.deliveryMethod),
        status: "aguardando_pagamento",
        total: totalPrice,
        deliveryFee: deliveryFee,
        finalTotal: finalPrice,
      }

      // Salvar no Firestore
      await addOrder(orderDetails)

      // Abrir WhatsApp
      window.open(generateWhatsAppMessage(), "_blank")

      // Limpar carrinho após envio bem-sucedido
      clearCart()
      setIsOpen(false)

      showNotification("Pedido enviado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao enviar pedido:", error)
      showNotification("Erro ao enviar pedido. Tente novamente.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Botão do carrinho */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-amber-700 text-white rounded-full shadow-lg hover:bg-amber-800 transition-all duration-300 flex items-center justify-center"
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Painel do carrinho */}
      <div
        className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>

        {/* Conteúdo do carrinho */}
        <div
          className={`relative w-full max-w-md bg-white h-full shadow-xl transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } flex flex-col`}
        >
          {/* Cabeçalho */}
          <div className="p-4 border-b flex items-center justify-between bg-amber-50">
            <h2 className="text-lg font-semibold text-amber-800 flex items-center">
              <ShoppingCart size={20} className="mr-2" />
              Seu Carrinho
            </h2>
            <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-amber-100 transition-colors">
              <X size={20} className="text-amber-800" />
            </button>
          </div>

          {/* Lista de itens */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart size={48} className="mb-4 opacity-30" />
                <p className="text-center">Seu carrinho está vazio</p>
                <Link href="/produtos" className="mt-4 text-amber-700 hover:text-amber-800 font-medium">
                  Continuar comprando
                </Link>
              </div>
            ) : (
              <>
                <ul className="space-y-4 mb-6">
                  {items.map((item) => (
                    <li key={item.id} className="flex border-b pb-4">
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="text-amber-700 font-semibold mt-1">R$ {formatPrice(item.price)}</p>
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="mx-2 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Formulário de dados do pedido */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium text-gray-700">Dados para finalização</h3>

                  {/* Nome do cliente */}
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      value={orderData.customerName}
                      onChange={(e) => updateOrderData({ customerName: e.target.value })}
                      className={`w-full px-3 py-2 border ${
                        formErrors.customerName ? "border-red-500" : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      placeholder="Seu nome completo"
                    />
                    {formErrors.customerName && <p className="mt-1 text-xs text-red-500">Nome é obrigatório</p>}
                  </div>

                  {/* Forma de pagamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de pagamento <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`grid grid-cols-2 gap-2 ${formErrors.paymentMethod ? "border border-red-500 rounded-md p-1" : ""}`}
                    >
                      <label
                        className={`flex items-center p-2 border rounded-md cursor-pointer ${
                          orderData.paymentMethod === "pix" ? "bg-amber-50 border-amber-500" : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="pix"
                          checked={orderData.paymentMethod === "pix"}
                          onChange={() => updateOrderData({ paymentMethod: "pix" })}
                          className="sr-only"
                        />
                        <span className="flex items-center text-sm">
                          <CreditCard size={16} className="mr-1" /> PIX
                        </span>
                      </label>
                      <label
                        className={`flex items-center p-2 border rounded-md cursor-pointer ${
                          orderData.paymentMethod === "credit" ? "bg-amber-50 border-amber-500" : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit"
                          checked={orderData.paymentMethod === "credit"}
                          onChange={() => updateOrderData({ paymentMethod: "credit" })}
                          className="sr-only"
                        />
                        <span className="flex items-center text-sm">
                          <CreditCard size={16} className="mr-1" /> Crédito
                        </span>
                      </label>
                      <label
                        className={`flex items-center p-2 border rounded-md cursor-pointer ${
                          orderData.paymentMethod === "debit" ? "bg-amber-50 border-amber-500" : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="debit"
                          checked={orderData.paymentMethod === "debit"}
                          onChange={() => updateOrderData({ paymentMethod: "debit" })}
                          className="sr-only"
                        />
                        <span className="flex items-center text-sm">
                          <CreditCard size={16} className="mr-1" /> Débito
                        </span>
                      </label>
                      <label
                        className={`flex items-center p-2 border rounded-md cursor-pointer ${
                          orderData.paymentMethod === "cash" ? "bg-amber-50 border-amber-500" : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={orderData.paymentMethod === "cash"}
                          onChange={() => updateOrderData({ paymentMethod: "cash" })}
                          className="sr-only"
                        />
                        <span className="flex items-center text-sm">
                          <CreditCard size={16} className="mr-1" /> Dinheiro
                        </span>
                      </label>
                    </div>
                    {formErrors.paymentMethod && (
                      <p className="mt-1 text-xs text-red-500">Selecione uma forma de pagamento</p>
                    )}
                  </div>

                  {/* Forma de entrega */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de entrega <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`space-y-2 ${formErrors.deliveryMethod ? "border border-red-500 rounded-md p-1" : ""}`}
                    >
                      <label
                        className={`flex items-center p-2 border rounded-md cursor-pointer ${
                          orderData.deliveryMethod === "pickup" ? "bg-amber-50 border-amber-500" : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="pickup"
                          checked={orderData.deliveryMethod === "pickup"}
                          onChange={() => updateOrderData({ deliveryMethod: "pickup" })}
                          className="sr-only"
                        />
                        <span className="flex items-center text-sm">
                          <Truck size={16} className="mr-1" /> Retirada no local (sem custo)
                        </span>
                      </label>
                      <label
                        className={`flex items-center p-2 border rounded-md cursor-pointer ${
                          orderData.deliveryMethod === "local" ? "bg-amber-50 border-amber-500" : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="local"
                          checked={orderData.deliveryMethod === "local"}
                          onChange={() => updateOrderData({ deliveryMethod: "local" })}
                          className="sr-only"
                        />
                        <span className="flex items-center text-sm">
                          <Truck size={16} className="mr-1" /> Entrega local em Seara - SC (+R$10,00)
                        </span>
                      </label>
                    </div>
                    {formErrors.deliveryMethod && (
                      <p className="mt-1 text-xs text-red-500">Selecione uma forma de entrega</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Rodapé com total e botão de finalizar */}
          <div className="p-4 border-t bg-amber-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm font-medium">R$ {formatPrice(totalPrice)}</span>
              </div>

              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de entrega</span>
                  <span className="text-sm font-medium">R$ {formatPrice(deliveryFee)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-amber-200">
                <span className="font-medium">Total</span>
                <span className="font-bold text-amber-800">R$ {formatPrice(finalPrice)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={items.length === 0 || isSubmitting}
              className={`w-full py-3 flex items-center justify-center rounded-md ${
                items.length === 0 || isSubmitting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white font-medium transition-colors`}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  Processando...
                </>
              ) : (
                <>
                  Finalizar via WhatsApp
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
            <Link
              href="/produtos"
              className="mt-3 w-full py-2 flex items-center justify-center rounded-md border border-amber-700 text-amber-800 hover:bg-amber-50 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
