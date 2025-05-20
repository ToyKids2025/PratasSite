import Image from "next/image"
import Link from "next/link"
import { Heart, Eye } from "lucide-react"
import { CountdownTimer } from "./countdown-timer"
import { AddToCartButton } from "./add-to-cart-button"

export interface ProductProps {
  id: number
  nome: string
  precoOriginal: number
  precoAtual: number
  desconto: number
  imagem: string
  badge?: string
  promocao?: boolean
  fimPromocao?: Date
}

export function ProductCard({ produto }: { produto: ProductProps }) {
  // Data de fim da promoção (3 dias a partir de agora)
  const fimPromocao = produto.fimPromocao || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

  return (
    <div className="product-card group">
      <div className="relative overflow-hidden">
        {produto.desconto > 0 && <div className="discount-badge">-{produto.desconto}%</div>}

        {produto.badge && <div className="promo-badge">{produto.badge}</div>}

        <div className="relative overflow-hidden">
          <Image
            src={produto.imagem || "/placeholder.svg"}
            alt={produto.nome}
            width={300}
            height={300}
            className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <Link
                href={`/produto/${produto.id}`}
                className="p-2 bg-white rounded-full shadow-md hover:bg-amber-50 transition-colors"
              >
                <Eye size={16} className="text-amber-800" />
              </Link>
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-amber-50 transition-colors">
                <Heart size={16} className="text-amber-800" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-medium text-center text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2 h-10">{produto.nome}</h3>

        <div className="flex flex-col items-center mb-2 sm:mb-3">
          <div className="text-[10px] sm:text-xs text-gray-500 flex items-center">
            <span className="line-through">R$ {produto.precoOriginal.toFixed(2).replace(".", ",")}</span>
            <span className="ml-1 sm:ml-2 bg-red-100 text-red-600 px-1 rounded-full text-[10px] sm:text-xs">
              Economize: R$ {(produto.precoOriginal - produto.precoAtual).toFixed(2).replace(".", ",")}
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold text-red-600 mt-1">
            R$ {produto.precoAtual.toFixed(2).replace(".", ",")}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Em até 3x de R$ {(produto.precoAtual / 3).toFixed(2).replace(".", ",")}
          </div>
        </div>

        {produto.promocao && (
          <div className="mb-3 bg-amber-50 p-2 rounded-lg">
            <div className="text-[10px] text-center text-amber-800 font-medium mb-1">Oferta por tempo limitado:</div>
            <CountdownTimer endDate={fimPromocao} />
          </div>
        )}

        <div className="flex space-x-2 mt-3">
          <Link
            href={`/produto/${produto.id}`}
            className="flex-1 px-3 py-1.5 bg-gradient-to-r from-amber-700 to-amber-800 text-white text-[10px] sm:text-sm text-center rounded-full hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-sm hover:shadow"
          >
            Ver Detalhes
          </Link>
          <AddToCartButton
            product={{
              id: produto.id.toString(),
              name: produto.nome,
              price: produto.precoAtual,
              image: produto.imagem,
            }}
            className="btn-add flex-1 px-3 py-1.5 text-[10px] sm:text-sm rounded-full"
          />
        </div>
      </div>
    </div>
  )
}
