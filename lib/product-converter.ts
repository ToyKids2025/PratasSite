import type { ProductProps } from "@/components/product-card"

// Função segura para converter produtos do Firestore para o formato do ProductCard
export function safeConvertProduct(product: any): ProductProps {
  // Valores padrão seguros
  const defaultProduct: ProductProps = {
    id: Math.floor(Math.random() * 10000),
    nome: "Produto",
    precoOriginal: 0,
    precoAtual: 0,
    desconto: 0,
    imagem: "/silver-product.png",
    promocao: false,
  }

  // Se o produto for inválido, retornar o produto padrão
  if (!product || typeof product !== "object") {
    return defaultProduct
  }

  try {
    // Extrair valores com segurança
    const id = typeof product.id === "string" || typeof product.id === "number" ? product.id : defaultProduct.id

    const nome = typeof product.name === "string" ? product.name : defaultProduct.nome

    const precoOriginal =
      typeof product.originalPrice === "number"
        ? product.originalPrice
        : typeof product.originalPrice === "string"
          ? Number.parseFloat(product.originalPrice) || defaultProduct.precoOriginal
          : defaultProduct.precoOriginal

    const precoAtual =
      typeof product.currentPrice === "number"
        ? product.currentPrice
        : typeof product.currentPrice === "string"
          ? Number.parseFloat(product.currentPrice) || defaultProduct.precoAtual
          : defaultProduct.precoAtual

    // Calcular desconto com segurança
    let desconto = defaultProduct.desconto
    if (precoOriginal > 0 && precoAtual > 0 && precoOriginal > precoAtual) {
      if (product.promotion?.discountPercentage && typeof product.promotion.discountPercentage === "number") {
        desconto = product.promotion.discountPercentage
      } else {
        desconto = Math.round(((precoOriginal - precoAtual) / precoOriginal) * 100)
      }
    }

    // Extrair imagem com segurança
    const imagem =
      product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : defaultProduct.imagem

    // Extrair badge com segurança
    const badge =
      product.promotion?.badge && typeof product.promotion.badge === "string" ? product.promotion.badge : undefined

    // Verificar promoção
    const promocao = product.promotion?.active === true

    // Extrair data de fim da promoção com segurança
    let fimPromocao: Date | undefined = undefined
    if (promocao && product.promotion?.endDate) {
      try {
        // Tentar converter para Date de várias formas
        if (product.promotion.endDate instanceof Date) {
          fimPromocao = product.promotion.endDate
        } else if (typeof product.promotion.endDate === "string") {
          fimPromocao = new Date(product.promotion.endDate)
        } else if (product.promotion.endDate.toDate && typeof product.promotion.endDate.toDate === "function") {
          fimPromocao = product.promotion.endDate.toDate()
        } else if (product.promotion.endDate._seconds) {
          // Lidar com timestamp do Firestore
          fimPromocao = new Date(product.promotion.endDate._seconds * 1000)
        }

        // Verificar se a data é válida
        if (fimPromocao && isNaN(fimPromocao.getTime())) {
          fimPromocao = undefined
        }
      } catch (e) {
        console.error("Erro ao converter data de promoção:", e)
        fimPromocao = undefined
      }
    }

    return {
      id,
      nome,
      precoOriginal,
      precoAtual,
      desconto,
      imagem,
      badge,
      promocao,
      fimPromocao,
    }
  } catch (error) {
    console.error("Erro ao converter produto:", error)
    return defaultProduct
  }
}
