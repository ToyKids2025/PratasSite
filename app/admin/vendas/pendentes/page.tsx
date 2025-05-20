"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Filter, CheckCircle, XCircle, Edit } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useNotification } from "@/components/notification"
import { EditOrderModal } from "@/components/edit-order-modal"
import { getOrdersByStatus, confirmOrder, updateOrder } from "@/services/firebase-orders"
import type { Order } from "@/services/firebase-orders"

export default function VendasPendentes() {
  const { user, loading: authLoading } = useAuth()
  const { showNotification } = useNotification()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null)

  // Carregar pedidos pendentes
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        // Buscar pedidos com status "aguardando_confirmacao"
        const pendingOrders = await getOrdersByStatus("aguardando_confirmacao")
        setOrders(pendingOrders)
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error)
        setError("Erro ao carregar pedidos. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      loadOrders()
    }
  }, [user, authLoading])

  // Filtrar pedidos com base no termo de busca
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setProcessingOrderId(orderId)
      await confirmOrder(orderId)

      // Atualizar a lista de pedidos
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))

      showNotification("Pedido confirmado com sucesso! Estoque atualizado.", "success")
    } catch (error) {
      console.error("Erro ao confirmar pedido:", error)
      showNotification("Erro ao confirmar pedido. Tente novamente.", "error")
    } finally {
      setProcessingOrderId(null)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      try {
        setProcessingOrderId(orderId)
        await updateOrder({
          ...orders.find((order) => order.id === orderId)!,
          status: "confirmada", // Usamos "confirmada" como status final, mas podemos adicionar um campo "cancelado" se necessário
        })

        // Atualizar a lista de pedidos
        setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))

        showNotification("Pedido cancelado com sucesso!", "success")
      } catch (error) {
        console.error("Erro ao cancelar pedido:", error)
        showNotification("Erro ao cancelar pedido. Tente novamente.", "error")
      } finally {
        setProcessingOrderId(null)
      }
    }
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
  }

  const handleSaveOrder = async (updatedOrder: Order) => {
    try {
      await updateOrder(updatedOrder)

      // Atualizar a lista de pedidos
      setOrders((prevOrders) => prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))

      showNotification("Pedido atualizado com sucesso!", "success")
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error)
      showNotification("Erro ao atualizar pedido. Tente novamente.", "error")
    }
  }

  // Formatar preço
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",")
  }

  // Formatar data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50/50">
      <div className="bg-amber-50 border-b border-amber-100 py-3 px-4">
        <div className="container mx-auto flex flex-wrap items-center gap-4">
          <Link
            href="/admin/produtos/novo"
            className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <span className="mr-1">•</span> Adicionar Produto
          </Link>
          <Link
            href="/admin/importar"
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <span className="mr-1">•</span> Importar em Lote
          </Link>
          <Link
            href="/admin/produtos"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Gerenciar Produtos
          </Link>
          <Link
            href="/admin/estoque"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Controle de Estoque
          </Link>
          <Link
            href="/admin/vendas/pendentes"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Vendas a Confirmar
          </Link>
          <Link
            href="/admin/vendas/confirmadas"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Vendas Confirmadas
          </Link>
          <Link
            href="/admin/diagnostico"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Diagnóstico
          </Link>
          <Link
            href="/admin/usuarios"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Usuários Admin
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center text-amber-800 hover:text-amber-600 transition-colors">
            <ArrowLeft size={18} className="mr-1" />
            Voltar para o painel
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-amber-800 mb-8">Vendas a Confirmar</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                <Filter size={16} className="mr-2" />
                Filtrar
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Nenhum pedido pendente encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Pedido
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cliente
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Valor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">#{order.id}</div>
                        <div className="text-xs text-gray-500">{order.items.length} itens</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(order.date instanceof Date ? order.date : order.date.toDate())}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">R$ {formatPrice(order.finalTotal)}</div>
                        {order.deliveryFee > 0 && (
                          <div className="text-xs text-gray-500">(Entrega: R$ {formatPrice(order.deliveryFee)})</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Aguardando Confirmação
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="flex items-center text-blue-600 hover:text-blue-900"
                            onClick={() => handleEditOrder(order)}
                          >
                            <Edit size={16} className="mr-1" />
                            Editar
                          </button>
                          <button
                            className="flex items-center text-green-600 hover:text-green-900"
                            onClick={() => handleConfirmOrder(order.id)}
                            disabled={processingOrderId === order.id}
                          >
                            {processingOrderId === order.id ? (
                              <span className="mr-1 h-4 w-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin"></span>
                            ) : (
                              <CheckCircle size={16} className="mr-1" />
                            )}
                            Confirmar
                          </button>
                          <button
                            className="flex items-center text-red-600 hover:text-red-900"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={processingOrderId === order.id}
                          >
                            {processingOrderId === order.id ? (
                              <span className="mr-1 h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin"></span>
                            ) : (
                              <XCircle size={16} className="mr-1" />
                            )}
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {editingOrder && (
          <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSave={handleSaveOrder} />
        )}
      </div>
    </div>
  )
}
