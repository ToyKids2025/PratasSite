"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Filter, CheckCircle, XCircle, Edit } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useNotification } from "@/components/notification"
import { EditOrderModal } from "@/components/edit-order-modal"

// Tipo para os pedidos
interface Order {
  id: string
  customer: string
  date: string
  items: {
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }[]
  paymentMethod: string
  deliveryMethod: string
  status: "aguardando_pagamento" | "pagamento_aprovado" | "separando" | "enviado"
  total: number
  deliveryFee: number
  finalTotal: number
}

export default function VendasPendentes() {
  const { user, loading: authLoading } = useAuth()
  const { showNotification } = useNotification()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // Dados de exemplo para vendas pendentes
  const vendasPendentes = [
    {
      id: "Maria-123456",
      customer: "Maria Silva",
      date: "15/05/2025",
      items: [
        {
          id: "1",
          name: "Anel de Prata 925",
          price: 99.9,
          quantity: 2,
          image: "/silver-product.png",
        },
        {
          id: "2",
          name: "Brinco Argola",
          price: 100.1,
          quantity: 1,
          image: "/joia-de-prata.png",
        },
      ],
      paymentMethod: "PIX",
      deliveryMethod: "Retirada no local",
      status: "aguardando_pagamento",
      total: 299.9,
      deliveryFee: 0,
      finalTotal: 299.9,
    },
    {
      id: "Joao-654321",
      customer: "João Santos",
      date: "16/05/2025",
      items: [
        {
          id: "3",
          name: "Pulseira com Zircônia",
          price: 150.5,
          quantity: 1,
          image: "/silver-product.png",
        },
      ],
      paymentMethod: "Cartão de crédito",
      deliveryMethod: "Entrega local em Seara - SC",
      status: "pagamento_aprovado",
      total: 150.5,
      deliveryFee: 10,
      finalTotal: 160.5,
    },
    {
      id: "Ana-789012",
      customer: "Ana Oliveira",
      date: "16/05/2025",
      items: [
        {
          id: "4",
          name: "Colar Pingente Coração",
          price: 112.5,
          quantity: 4,
          image: "/joia-de-prata.png",
        },
      ],
      paymentMethod: "Dinheiro",
      deliveryMethod: "Retirada no local",
      status: "separando",
      total: 450.0,
      deliveryFee: 0,
      finalTotal: 450.0,
    },
    {
      id: "Carlos-345678",
      customer: "Carlos Pereira",
      date: "17/05/2025",
      items: [
        {
          id: "5",
          name: "Tornozeleira Prata 925",
          price: 99.95,
          quantity: 2,
          image: "/silver-product.png",
        },
      ],
      paymentMethod: "Cartão de débito",
      deliveryMethod: "Entrega local em Seara - SC",
      status: "enviado",
      total: 199.9,
      deliveryFee: 10,
      finalTotal: 209.9,
    },
  ]

  useEffect(() => {
    // Aqui você carregaria os pedidos do Firebase
    // Por enquanto, vamos usar os dados de exemplo
    setOrders(vendasPendentes)
    setLoading(false)
  }, [])

  const handleConfirmOrder = (orderId: string) => {
    // Aqui você atualizaria o status do pedido no Firebase
    // e reduziria o estoque dos produtos

    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status: "pagamento_aprovado" as const } : order)),
    )

    showNotification("Pedido confirmado com sucesso!", "success")
  }

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      // Aqui você cancelaria o pedido no Firebase

      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))

      showNotification("Pedido cancelado com sucesso!", "success")
    }
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
  }

  const handleSaveOrder = (updatedOrder: Order) => {
    setOrders((prevOrders) => prevOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))

    showNotification("Pedido atualizado com sucesso!", "success")
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "aguardando_pagamento":
        return "bg-yellow-100 text-yellow-800"
      case "pagamento_aprovado":
        return "bg-green-100 text-green-800"
      case "separando":
        return "bg-blue-100 text-blue-800"
      case "enviado":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "aguardando_pagamento":
        return "Aguardando Pagamento"
      case "pagamento_aprovado":
        return "Pagamento Aprovado"
      case "separando":
        return "Separando"
      case "enviado":
        return "Enviado"
      default:
        return status
    }
  }

  // Formatar preço
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(".", ",")
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
            Vendas Pendentes
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

        <h1 className="text-2xl font-semibold text-amber-800 mb-8">Vendas Pendentes</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar pedidos..."
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
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">#{order.id}</div>
                      <div className="text-xs text-gray-500">{order.items.length} itens</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{order.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">R$ {formatPrice(order.finalTotal)}</div>
                      {order.deliveryFee > 0 && (
                        <div className="text-xs text-gray-500">(Entrega: R$ {formatPrice(order.deliveryFee)})</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}
                      >
                        {getStatusText(order.status)}
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
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Aprovar
                        </button>
                        <button
                          className="flex items-center text-red-600 hover:text-red-900"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <XCircle size={16} className="mr-1" />
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {editingOrder && (
          <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSave={handleSaveOrder} />
        )}
      </div>
    </div>
  )
}
