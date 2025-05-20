import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Importar dinamicamente para evitar problemas de inicialização
    const { getAdminDb } = await import("@/services/firebase-admin")

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin não está disponível" }, { status: 500 })
    }

    const id = params.id
    const backupDoc = await db.collection("backups").doc(id).get()

    if (!backupDoc.exists) {
      return NextResponse.json({ error: "Backup não encontrado" }, { status: 404 })
    }

    const backupData = backupDoc.data()

    // Converter timestamps para strings ISO
    const processedData = {
      ...backupData,
      timestamp: backupData.timestamp.toDate().toISOString(),
      products: backupData.products.map((product: any) => ({
        ...product,
        createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
        updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : null,
        promotion: product.promotion
          ? {
              ...product.promotion,
              endDate: product.promotion.endDate ? new Date(product.promotion.endDate).toISOString() : null,
            }
          : null,
      })),
    }

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("Erro ao baixar backup:", error)
    return NextResponse.json(
      { error: "Erro ao baixar backup. Por favor, tente novamente mais tarde." },
      { status: 500 },
    )
  }
}
