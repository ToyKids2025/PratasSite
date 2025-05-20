import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Importar dinamicamente para evitar problemas de inicialização
    const { getAllProductsAdmin, getProductAdmin } = await import("@/services/firebase-admin")

    // Verificar se há um ID específico na query
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // Buscar um produto específico
      const product = await getProductAdmin(id)

      if (!product) {
        return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
      }

      return NextResponse.json(product)
    } else {
      // Buscar todos os produtos
      const products = await getAllProductsAdmin()
      return NextResponse.json(products)
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar produtos. Por favor, tente novamente mais tarde." },
      { status: 500 },
    )
  }
}
