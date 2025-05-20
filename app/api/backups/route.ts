import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Importar dinamicamente para evitar problemas de inicialização
    const { getAdminDb } = await import("@/services/firebase-admin")

    const db = getAdminDb()
    if (!db) {
      return NextResponse.json([])
    }

    const backupsRef = db.collection("backups")
    const backupsSnap = await backupsRef.orderBy("timestamp", "desc").get()

    const backups = []
    backupsSnap.forEach((doc: any) => {
      const data = doc.data()
      backups.push({
        id: doc.id,
        timestamp: data.timestamp.toDate(),
        date: data.date,
        productCount: data.products?.length || 0,
      })
    })

    return NextResponse.json(backups)
  } catch (error) {
    console.error("Erro ao buscar backups:", error)
    return NextResponse.json(
      { error: "Erro ao buscar backups. Por favor, tente novamente mais tarde." },
      { status: 500 },
    )
  }
}
