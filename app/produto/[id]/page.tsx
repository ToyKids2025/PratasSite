"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Heart, Share2, Star, Truck, Shield, RotateCcw } from "lucide-react"
import { CountdownTimer } from "@/components/countdown-timer"
import { AddToCartButton } from "@/components/add-to-cart-button"

const useFallbackData = (params: { id: string }) => {
  return {
    id: params.id,
    nome: "Produto não encontrado",
    precoOriginal: 0,
    precoAtual: 0,
    desconto: 0,
    imagem: "/placeholder.svg",
    descricao: "Este produto não está disponível no momento.",
    caracteristicas: ["Produto não encontrado"],
    promocao: false,
    fimPromocao: new Date(),
    avaliacao: 0,
    numAvaliacoes: 0,
  }
}

export default function ProdutoDetalhe({ params }: { params: { id: string } }) {
  const [produto, setProduto] = useState<any>(useFallbackData(params))
  const [loading, setLoading] = useState(true)

  const fetchProduto = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduto({
          id: data.id,
          nome: data.name,
          precoOriginal: data.originalPrice,
          precoAtual: data.currentPrice,
          desconto:
            data.promotion?.discountPercentage ||
            Math.round(((data.originalPrice - data.currentPrice) / data.originalPrice) * 100),
          imagem: data.images[0] || "/silver-product.png",
          descricao: data.description,
          caracteristicas: data.features,
          promocao: data.promotion?.active || false,
          fimPromocao: data.promotion?.endDate
            ? new Date(data.promotion.endDate)
            : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          avaliacao: data.rating || 4.5,
          numAvaliacoes: data.reviewCount || 28,
        })
      }
    } catch (error) {
      console.error("Erro ao buscar produto:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduto()
  }, [params])

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

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative p-4">
            {produto.desconto > 0 && (
              <div className="absolute top-6 left-6 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                -{produto.desconto}%
              </div>
            )}
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src={produto.imagem || "/placeholder.svg"}
                alt={produto.nome}
                width={600}
                height={600}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="p-6 flex flex-col">
            <div className="flex items-center mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < Math.floor(produto.avaliacao)
                        ? "text-amber-500 fill-amber-500"
                        : i < produto.avaliacao
                          ? "text-amber-500 fill-amber-500 opacity-50"
                          : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-2">({produto.numAvaliacoes} avaliações)</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-amber-800 mb-4">{produto.nome}</h1>

            <div className="mb-4">
              <div className="text-sm text-gray-500">
                <span className="line-through">R$ {produto.precoOriginal.toFixed(2).replace(".", ",")}</span>
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  Economize: R$ {(produto.precoOriginal - produto.precoAtual).toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mt-1">
                R$ {produto.precoAtual.toFixed(2).replace(".", ",")}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Em até 3x de R$ {(produto.precoAtual / 3).toFixed(2).replace(".", ",")} sem juros
              </div>
            </div>

            {produto.promocao && (
              <div className="mb-6 bg-amber-50 p-3 rounded-lg">
                <div className="text-xs text-center text-amber-800 font-medium mb-2">Oferta por tempo limitado:</div>
                <CountdownTimer endDate={produto.fimPromocao} />
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-medium text-amber-800 mb-2">Descrição</h2>
              <p className="text-gray-700 text-sm">{produto.descricao}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-medium text-amber-800 mb-2">Características</h2>
              <ul className="list-disc pl-5 text-gray-700 text-sm">
                {produto.caracteristicas.map((caracteristica: string, index: number) => (
                  <li key={index}>{caracteristica}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg">
                <Truck size={20} className="text-amber-700 mb-1" />
                <span className="text-xs text-center text-amber-800">Frete Grátis</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg">
                <Shield size={20} className="text-amber-700 mb-1" />
                <span className="text-xs text-center text-amber-800">Garantia</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-lg">
                <RotateCcw size={20} className="text-amber-700 mb-1" />
                <span className="text-xs text-center text-amber-800">Troca Fácil</span>
              </div>
            </div>

            <div className="mt-auto flex flex-col space-y-3">
              <AddToCartButton
                product={{
                  id: produto.id.toString(),
                  name: produto.nome,
                  price: produto.precoAtual,
                  image: produto.imagem,
                }}
                variant="primary"
                className="w-full py-3 rounded-full font-medium text-base shadow-md hover:shadow-lg"
              />
              <div className="flex space-x-3">
                <button className="flex-1 py-2 border border-amber-700 text-amber-800 font-medium rounded-full hover:bg-amber-50 transition-colors flex items-center justify-center">
                  <Heart size={18} className="mr-1" /> Favoritar
                </button>
                <button className="flex-1 py-2 border border-amber-700 text-amber-800 font-medium rounded-full hover:bg-amber-50 transition-colors flex items-center justify-center">
                  <Share2 size={18} className="mr-1" /> Compartilhar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
