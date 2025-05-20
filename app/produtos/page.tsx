"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ProductCard, type ProductProps } from "@/components/product-card"
import { ArrowLeft } from "lucide-react"

// Remover a função useFallbackData que continha produtos de exemplo
const useFallbackData = () => {
  // Retornar array vazio em vez de produtos de exemplo
  return []
}

export default function Produtos() {
  const [produtos, setProdutos] = useState<ProductProps[]>([])
  const [loading, setLoading] = useState(true)

  // No useEffect, modificar para lidar melhor com a ausência de dados
  useEffect(() => {
    // Tentar buscar produtos da API
    const fetchProdutos = async () => {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          // Verificar se há dados antes de converter
          if (Array.isArray(data) && data.length > 0) {
            // Converter para o formato esperado pelo ProductCard
            const produtosFormatados = data.map((produto: any) => ({
              id: Number(produto.id) || Math.floor(Math.random() * 1000),
              nome: produto.name,
              precoOriginal: produto.originalPrice,
              precoAtual: produto.currentPrice,
              desconto:
                produto.promotion?.discountPercentage ||
                Math.round(((produto.originalPrice - produto.currentPrice) / produto.originalPrice) * 100),
              imagem: produto.images[0] || "/silver-product.png",
              badge: produto.promotion?.badge || null,
              promocao: produto.promotion?.active || false,
              fimPromocao: produto.promotion?.endDate ? new Date(produto.promotion.endDate) : undefined,
            }))
            setProdutos(produtosFormatados)
          } else {
            // Se não houver dados, definir array vazio
            setProdutos([])
          }
        } else {
          // Fallback para array vazio
          setProdutos([])
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        setProdutos([])
      } finally {
        setLoading(false)
      }
    }

    fetchProdutos()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/"
          className="flex items-center text-amber-800 hover:text-amber-600 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft size={18} className="mr-1" />
          Voltar para a página inicial
        </Link>
      </div>

      <h1 className="section-title">Todos os Produtos</h1>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
        {produtos.map((produto) => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </div>
    </div>
  )
}
