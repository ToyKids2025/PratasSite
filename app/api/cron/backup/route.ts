import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Verificar autenticação (em um ambiente real, você usaria um token de API)
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("key")

    if (apiKey !== process.env.BACKUP_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Importar dinamicamente para evitar problemas de inicialização
    const { createBackupAdmin } = await import("@/services/firebase-admin")

    // Verificar se já existe um backup para hoje
    const backupId = await createBackupAdmin()

    return NextResponse.json({ success: true, backupId })
  } catch (error) {
    console.error("Erro ao criar backup agendado:", error)
    return NextResponse.json(
      { error: "Erro ao criar backup agendado. Por favor, tente novamente mais tarde." },
      { status: 500 },
    )
  }
}
