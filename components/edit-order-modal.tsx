"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus, Minus, Save } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Order {
  id: string
  customer: string
  date: string
  items: OrderItem[]
  paymentMethod: string
  deliveryMethod: string
  status: string
  total: number
  deliveryFee: number
  finalTotal: number
}

interface EditOrderModalProps {
  order: Order | null
  onClose: () => void
  onSave: (updatedOrder: Order) => void
}

export function EditOrderModal({ order, onClose, onSave }: EditOrderModalProps) {
  const [editedOrder, setEditedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (order) {
      setEditedOrder({ ...order })
    }
  }, [order])

  if (!editedOrder) return null

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedOrder({ ...editedOrder, customer: e.target.value })
  }

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedOrder({ ...editedOrder, paymentMethod: e.target.value })
  }

  const handleDeliveryMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeliveryMethod = e.target.value
    const deliveryFee = newDeliveryMethod === "Entrega local em Seara - SC" ? 10 : 0
    const finalTotal = editedOrder.total + deliveryFee

    setEditedOrder({
      ...editedOrder,
      deliveryMethod: newDeliveryMethod,
      deliveryFee,
      finalTotal,
    })
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedItems = editedOrder.items.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item,
    )

    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const finalTotal = total + editedOrder.deliveryFee

    setEditedOrder({
      ...editedOrder,
      items: updatedItems,
      total,
      finalTotal,
    })
  }

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = editedOrder.items.filter((item) => item.id !== itemId)

    if (updatedItems.length === 0) {
      // Se não houver mais itens, fechar o modal
      onClose()
      return
    }

    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const finalTotal = total + editedOrder.deliveryFee

    setEditedOrder({
      ...editedOrder,
      items: updatedItems,
      total,
      finalTotal,
    })
  }

  const handleSave = () => {
    onSave(editedOrder)
    onClose()
  }

  // Formatar preço
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Editar Pedido #{editedOrder.id}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-4">
            {/* Nome do cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do cliente</label>
              <input
                type="text"
                value={editedOrder.customer}
                onChange={handleCustomerNameChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Forma de pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento</label>
              <select
                value={editedOrder.paymentMethod}
                onChange={handlePaymentMethodChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="PIX">PIX</option>
                <option value="Cartão de crédito">Cartão de crédito</option>
                <option value="Cartão de débito">Cartão de débito</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>

            {/* Forma de entrega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de entrega</label>
              <select
                value={editedOrder.deliveryMethod}
                onChange={handleDeliveryMethodChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Retirada no local">Retirada no local</option>
                <option value="Entrega local em Seara - SC">Entrega local em Seara - SC (+R$10,00)</option>
              </select>
            </div>

            {/* Itens do pedido */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Itens do pedido</h3>
              <div className="space-y-3">
                {editedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center border rounded-md p-2">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">R$ {formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 rounded-full border border-gray-300 hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-3 p-1 text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo de valores */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">R$ {formatPrice(editedOrder.total)}</span>
              </div>
              {editedOrder.deliveryFee > 0 && (
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Taxa de entrega:</span>
                  <span className="text-sm font-medium">R$ {formatPrice(editedOrder.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>R$ {formatPrice(editedOrder.finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center"
          >
            <Save size={16} className="mr-1" /> Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}
