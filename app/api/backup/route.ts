import { NextResponse } from "next/server"
import { createBackup } from "@/services/firebase"

export async function POST(request: Request) {
  try {
    // Verificar autenticação (em um ambiente real, você usaria um token de API)
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("key")

    if (apiKey !== process.env.BACKUP_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backupId = await createBackup()
    return NextResponse.json({ success: true, backupId })
  } catch (error) {
    console.error("Erro ao criar backup:", error)
    return NextResponse.json({ error: "Erro ao criar backup. Por favor, tente novamente mais tarde." }, { status: 500 })
  }
}
