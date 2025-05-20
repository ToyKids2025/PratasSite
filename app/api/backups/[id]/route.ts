import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Importar dinamicamente para evitar problemas de inicialização
    const { getAdminDb } = await import("@/services/firebase-admin")

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({ error: "Firebase Admin não está disponível" }, { status: 500 })
    }

    const id = params.id
    await db.collection("backups").doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir backup:", error)
    return NextResponse.json(
      { error: "Erro ao excluir backup. Por favor, tente novamente mais tarde." },
      { status: 500 },
    )
  }
}
