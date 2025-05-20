import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Importar dinamicamente para evitar problemas de inicialização
    const { getProductAdmin } = await import("@/services/firebase-admin")

    const id = params.id
    const product = await getProductAdmin(id)

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Erro ao buscar produto:", error)
    return NextResponse.json(
      { error: "Erro ao buscar produto. Por favor, tente novamente mais tarde." },
      { status: 500 },
    )
  }
}
