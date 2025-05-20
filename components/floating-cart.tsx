"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { ShoppingCart, X, Plus, Minus, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Tipo para os itens do carrinho
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

// Contexto do carrinho
interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
})

// Hook para usar o carrinho
export const useCart = () => useContext(CartContext)

// Provedor do carrinho
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isClient, setIsClient] = useState(false)

  // Inicializar do localStorage quando o componente montar
  useEffect(() => {
    setIsClient(true)
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Erro ao carregar carrinho:", error)
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Salvar no localStorage quando o carrinho mudar
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isClient])

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

  // Limpar o carrinho
  const clearCart = () => {
    setItems([])
  }

  // Calcular total de itens
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  // Calcular preço total
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Componente do carrinho flutuante
export function FloatingCart() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  // Formatar preço
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",")
  }

  // Gerar mensagem para WhatsApp
  const generateWhatsAppMessage = () => {
    if (items.length === 0) return ""

    const storePhone = "5549996824477" // Número da loja sem formatação
    let message = "Olá! Gostaria de fazer o seguinte pedido:\n\n"

    items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} - R$ ${formatPrice(item.price * item.quantity)}\n`
    })

    message += `\nTotal: R$ ${formatPrice(totalPrice)}\n\nPor favor, confirme a disponibilidade e o prazo de entrega.`

    return `https://wa.me/${storePhone}?text=${encodeURIComponent(message)}`
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
              <ul className="space-y-4">
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
                        <button onClick={() => removeItem(item.id)} className="ml-auto text-red-500 hover:text-red-700">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Rodapé com total e botão de finalizar */}
          <div className="p-4 border-t bg-amber-50">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total</span>
              <span className="font-bold text-amber-800">R$ {formatPrice(totalPrice)}</span>
            </div>
            <a
              href={generateWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-3 flex items-center justify-center rounded-md ${
                items.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              } text-white font-medium transition-colors`}
              onClick={(e) => {
                if (items.length === 0) {
                  e.preventDefault()
                }
              }}
            >
              Finalizar via WhatsApp
              <ArrowRight size={18} className="ml-2" />
            </a>
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
