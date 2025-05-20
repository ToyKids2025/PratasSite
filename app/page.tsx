import Image from "next/image"
import Link from "next/link"
import { ProductCard, type ProductProps } from "@/components/product-card"
import { ShoppingBag, ChevronRight } from "lucide-react"
import { productsAPI } from "@/services/firebase-rest"

// Produtos de exemplo para fallback
const produtosExemplo: ProductProps[] = []

export default async function Home() {
  // Buscar produtos em destaque usando a API REST
  let produtosDestaque: ProductProps[] = []

  try {
    // Buscar produtos em promoção
    const produtos = await productsAPI.getPromoted()

    // Converter produtos para o formato correto
    produtosDestaque = produtos.map((produto) => {
      return {
        id: produto.id,
        nome: produto.name || "Produto sem nome",
        precoOriginal: produto.originalPrice || produto.price || 0,
        precoAtual: produto.price || 0,
        desconto: produto.discount || 0,
        imagem: produto.images?.[0] || "/placeholder.svg",
        badge: produto.badge || "",
        promocao: produto.promotion?.active || false,
        fimPromocao: produto.promotion?.endDate ? new Date(produto.promotion.endDate) : undefined,
      }
    })

    // Se não houver produtos em promoção, buscar todos os produtos
    if (produtosDestaque.length === 0) {
      const todosProdutos = await productsAPI.getAll()
      produtosDestaque = todosProdutos.slice(0, 4).map((produto) => {
        return {
          id: produto.id,
          nome: produto.name || "Produto sem nome",
          precoOriginal: produto.originalPrice || produto.price || 0,
          precoAtual: produto.price || 0,
          desconto: produto.discount || 0,
          imagem: produto.images?.[0] || "/placeholder.svg",
          badge: produto.badge || "",
          promocao: produto.promotion?.active || false,
          fimPromocao: produto.promotion?.endDate ? new Date(produto.promotion.endDate) : undefined,
        }
      })
    }
  } catch (error) {
    console.error("Erro ao carregar produtos em destaque:", error)
    // Fallback para produtos de exemplo
    produtosDestaque = produtosExemplo
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-6">
      <div className="absolute top-4 right-4">
        <Link
          href="/admin"
          className="px-3 py-1 text-sm sm:px-4 sm:py-1 sm:text-base border border-amber-800 text-amber-800 rounded-full hover:bg-amber-50 transition-colors"
        >
          Admin
        </Link>
      </div>

      <div className="mt-8 sm:mt-12 mb-6 sm:mb-8 text-center">
        <Image
          src="/logo-flor-girassol.jpeg"
          alt="Flor de Girassol Pratas"
          width={220}
          height={220}
          className="mx-auto w-[180px] h-auto sm:w-[220px] drop-shadow-md"
          priority
        />
      </div>

      <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-amber-800 mb-6 sm:mb-8 text-center">
        Bem-vindo à Flor de Girassol Pratas
      </h1>

      <div className="w-full max-w-xs">
        <Link
          href="/categorias"
          className="w-full flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <ShoppingBag size={18} className="mr-2" />
          <span className="text-sm sm:text-base">Ver Categorias de Produtos</span>
        </Link>
      </div>

      <div className="w-full max-w-6xl mt-16 sm:mt-24">
        <div className="relative">
          <h2 className="section-title">Produtos em Destaque</h2>
        </div>

        {produtosDestaque.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
            {produtosDestaque.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mt-12">
            <p className="text-gray-500">Nenhum produto em destaque disponível no momento.</p>
          </div>
        )}

        <div className="flex justify-center mt-12">
          <Link
            href="/produtos"
            className="flex items-center justify-center px-6 py-3 bg-amber-700 text-white rounded-full hover:bg-amber-600 transition-colors"
          >
            <span className="text-sm sm:text-base">Ver Todos os Produtos</span>
            <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>
      </div>
    </main>
  )
}
