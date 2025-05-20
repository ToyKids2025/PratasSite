"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Search, Edit, Eye, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import type { Product } from "@/types/product"

export default function ProductList() {
  const { user, loading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadProducts() {
      if (authLoading) return

      if (!user) {
        setError("Você precisa estar autenticado para acessar esta página.")
        setLoading(false)
        return
      }

      try {
        // Usar a API para buscar produtos em vez de chamar diretamente o Firestore
        const response = await fetch("/api/products")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao carregar produtos")
        }

        const data = await response.json()
        setProducts(data)
        setError(null)
      } catch (error: any) {
        console.error("Erro ao carregar produtos:", error)
        setError(error.message || "Erro ao carregar produtos. Por favor, tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [user, authLoading])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-amber-800 hover:text-amber-600 transition-colors">
          <ArrowLeft size={18} className="mr-1" />
          Voltar para o painel
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-amber-800">Gerenciar Produtos</h1>
          <Link
            href="/admin/produtos/novo"
            className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-md hover:from-amber-600 hover:to-amber-700 transition-colors"
          >
            <Plus size={18} className="mr-1" /> Novo Produto
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700">{error}</p>
              <p className="text-sm text-red-600 mt-1">
                Tente fazer login novamente ou contate o administrador do sistema.
              </p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Ir para página de login
            </Link>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? "Nenhum produto encontrado para esta busca." : "Nenhum produto cadastrado."}
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
                    Produto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categoria
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Preço
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estoque
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Promoção
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
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 line-through">
                        R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                      </div>
                      <div className="text-sm font-medium text-red-600">
                        R$ {product.currentPrice.toFixed(2).replace(".", ",")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.promotion?.active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {product.promotion.badge ||
                            (product.promotion.type === "new"
                              ? "Novo"
                              : product.promotion.type === "bestseller"
                                ? "Mais Vendido"
                                : product.promotion.type === "limited"
                                  ? "Limitado"
                                  : product.promotion.type === "sale"
                                    ? "Oferta"
                                    : `${product.promotion.discountPercentage}% OFF`)}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Não
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/admin/produtos/${product.id}`} className="text-amber-800 hover:text-amber-600">
                          <Edit size={18} />
                        </Link>
                        <Link
                          href={`/produto/${product.id}`}
                          className="text-amber-800 hover:text-amber-600"
                          target="_blank"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
