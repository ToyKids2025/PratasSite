"use server"

export async function generateFirebaseRules() {
  try {
    // Usar a variável de ambiente no servidor, não exposta ao cliente
    const apiKey = process.env.BACKUP_API_KEY || ""

    // Construir a URL base
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/firebase-rules/update?key=${apiKey}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Erro ao gerar regras")
    }

    const data = await response.json()
    return {
      success: true,
      firestoreRules: data.firestoreRules,
      storageRules: data.storageRules,
    }
  } catch (error) {
    console.error("Erro ao gerar regras:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido ao gerar regras",
    }
  }
}
