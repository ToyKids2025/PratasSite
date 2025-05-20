import Image from "next/image"
import Link from "next/link"
import { ProductCard, type ProductProps } from "@/components/product-card"
import { ShoppingBag, ChevronRight } from "lucide-react"
import { safeConvertProduct } from "@/lib/product-converter"

// Produtos de exemplo para fallback
const produtosExemplo: ProductProps[] = [
  {
    id: 1,
    nome: "Anel de Prata 925 com Zircônia",
    precoOriginal: 345.0,
    precoAtual: 199.0,
    desconto: 42,
    imagem: "/silver-product.png",
    badge: "Mais Vendido",
    promocao: true,
    fimPromocao: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
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
    fimPromocao: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
  },
]

export default async function Home() {
  // Buscar produtos em destaque
  let produtosDestaque: ProductProps[] = []

  try {
    // Importar dinamicamente para evitar problemas de inicialização
    const { getAllProductsAdmin } = await import("@/services/firebase-admin")
    const produtos = await getAllProductsAdmin()

    // Verificar se produtos é um array válido
    if (!Array.isArray(produtos)) {
      throw new Error("Produtos não é um array válido")
    }

    // Filtrar produtos em promoção e limitar a 4
    const produtosPromocao = produtos
      .filter((p) => p && typeof p === "object" && p.promotion?.active === true)
      .slice(0, 4)

    // Converter produtos para o formato correto
    if (produtosPromocao.length === 0) {
      // Se não houver produtos em promoção, usar todos os produtos
      produtosDestaque = produtos.slice(0, 4).map((produto) => {
        return safeConvertProduct(produto)
      })
    } else {
      produtosDestaque = produtosPromocao.map((produto) => {
        return safeConvertProduct(produto)
      })
    }
  } catch (error) {
    console.error("Erro ao carregar produtos em destaque:", error)
    // Fallback para produtos de exemplo
    produtosDestaque = produtosExemplo
  }

  // Se ainda não tiver produtos, usar os exemplos
  if (produtosDestaque.length === 0) {
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

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-12">
          {produtosDestaque.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>

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
