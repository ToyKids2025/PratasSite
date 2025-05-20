"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { updateOrderStatus, deleteOrder } from "@/services/firebase-orders"
import { useNotification } from "./notification"

interface EditOrderModalProps {
  order: any
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function EditOrderModal({ order, isOpen, onClose, onUpdate }: EditOrderModalProps) {
  const [status, setStatus] = useState(order.status || "aguardando_confirmacao")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { showNotification } = useNotification()

  // Formatar preço
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",")
  }

  // Formatar data
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Atualizar status do pedido
  const handleUpdateStatus = async () => {
    try {
      setIsLoading(true)

      // Determinar se deve atualizar o estoque
      const shouldUpdateStock = status === "confirmada" && order.status !== "confirmada"

      await updateOrderStatus(order.firestoreId, status, shouldUpdateStock)

      showNotification("Status do pedido atualizado com sucesso!", "success")
      onUpdate()
      onClose()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      showNotification("Erro ao atualizar status do pedido.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Excluir pedido
  const handleDeleteOrder = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.")) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteOrder(order.firestoreId)
      showNotification("Pedido excluído com sucesso!", "success")
      onUpdate()
      onClose()
    } catch (error) {
      console.error("Erro ao excluir pedido:", error)
      showNotification("Erro ao excluir pedido.", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Detalhes do Pedido #{order.id}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Cliente</p>
              <p className="font-medium">{order.customer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data</p>
              <p className="font-medium">{formatDate(order.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Forma de Pagamento</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Forma de Entrega</p>
              <p className="font-medium">{order.deliveryMethod}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Itens do Pedido</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qtd
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{item.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{item.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">R$ {formatPrice(item.price)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                        R$ {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium">R$ {formatPrice(order.total)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Taxa de entrega</span>
                <span className="font-medium">R$ {formatPrice(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Total</span>
              <span className="font-bold">R$ {formatPrice(order.finalTotal)}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status do Pedido</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "aguardando_confirmacao" | "confirmada")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              disabled={isLoading}
            >
              <option value="aguardando_confirmacao">Aguardando Confirmação</option>
              <option value="confirmada">Confirmada</option>
            </select>
            {status === "confirmada" && order.status !== "confirmada" && (
              <p className="mt-1 text-xs text-amber-600">
                Ao confirmar este pedido, o estoque dos produtos será automaticamente atualizado.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleUpdateStatus}
              disabled={isLoading}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
            <button
              onClick={handleDeleteOrder}
              disabled={isDeleting}
              className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Excluindo..." : "Excluir Pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
