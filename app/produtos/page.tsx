"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ProductCard, type ProductProps } from "@/components/product-card"
import { ArrowLeft } from "lucide-react"

const useFallbackData = () => {
  // Produtos de exemplo
  return [
    {
      id: 1,
      nome: "Anel de Prata 925 com Zircônia",
      precoOriginal: 345.0,
      precoAtual: 199.0,
      desconto: 42,
      imagem: "/silver-product.png",
      badge: "Mais Vendido",
      promocao: true,
    },
    {
      id: 2,
      nome: "Brinco Argola Prata 925",
      precoOriginal: 120.0,
      precoAtual: 99.0,
      desconto: 18,
      imagem: "/joia-de-prata.png",
      badge: "Novo",
      promocao: true,
    },
    {
      id: 3,
      nome: "Colar Pingente Coração Prata 925",
      precoOriginal: 85.0,
      precoAtual: 75.0,
      desconto: 12,
      imagem: "/silver-product.png",
    },
    {
      id: 4,
      nome: "Pulseira Prata 925 com Zircônias",
      precoOriginal: 150.0,
      precoAtual: 129.0,
      desconto: 14,
      imagem: "/joia-de-prata.png",
      promocao: true,
    },
    {
      id: 5,
      nome: "Conjunto Colar e Brinco Prata 925",
      precoOriginal: 110.0,
      precoAtual: 89.0,
      desconto: 19,
      imagem: "/silver-product.png",
      badge: "Limitado",
    },
    {
      id: 6,
      nome: "Anel Solitário Prata 925",
      precoOriginal: 250.0,
      precoAtual: 199.0,
      desconto: 20,
      imagem: "/joia-de-prata.png",
    },
  ]
}

export default function Produtos() {
  const [produtos, setProdutos] = useState<ProductProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Tentar buscar produtos da API
    const fetchProdutos = async () => {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
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
          // Fallback para dados de exemplo
          setProdutos(useFallbackData())
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        setProdutos(useFallbackData())
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
