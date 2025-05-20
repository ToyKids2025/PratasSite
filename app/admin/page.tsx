"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login")
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50/50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-amber-800 mb-8">Painel Administrativo</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-amber-800 mb-4">Resumo</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Produtos cadastrados:</span>
                <span className="font-medium">124</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Produtos em estoque:</span>
                <span className="font-medium">98</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vendas pendentes:</span>
                <span className="font-medium text-amber-600">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vendas do mês:</span>
                <span className="font-medium text-green-600">45</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-amber-800 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Link
                href="/admin/produtos/novo"
                className="block w-full py-2 bg-red-600 text-white text-center rounded-md hover:bg-red-700 transition-colors"
              >
                Adicionar Produto
              </Link>
              <Link
                href="/admin/firebase-setup"
                className="block w-full py-2 bg-red-600 text-white text-center rounded-md hover:bg-red-700 transition-colors"
              >
                Resolver Erro de Permissões
              </Link>
              <Link
                href="/admin/vendas/pendentes"
                className="block w-full py-2 bg-amber-600 text-white text-center rounded-md hover:bg-amber-700 transition-colors"
              >
                Ver Vendas Pendentes
              </Link>
              <Link
                href="/admin/estoque"
                className="block w-full py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
              >
                Atualizar Estoque
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-amber-800 mb-4">Produtos Populares</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Anel de Prata 925</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">32 vendas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Brinco Argola</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">28 vendas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pulseira com Zircônia</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">21 vendas</span>
              </div>
              <Link
                href="/admin/relatorios/vendas"
                className="block text-sm text-blue-600 hover:text-blue-800 text-center mt-2"
              >
                Ver relatório completo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
