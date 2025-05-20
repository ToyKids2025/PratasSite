import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Verificar autenticação (em um ambiente real, você usaria um token de API)
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("key")

    if (apiKey !== process.env.BACKUP_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Regras do Firestore que permitem acesso total (apenas para desenvolvimento)
    const firestoreRules = `
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Permitir acesso total a todos os documentos (APENAS PARA DESENVOLVIMENTO)
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    `

    // Regras do Storage que permitem acesso total (apenas para desenvolvimento)
    const storageRules = `
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        // Permitir acesso total a todos os arquivos (APENAS PARA DESENVOLVIMENTO)
        match /{allPaths=**} {
          allow read, write: if true;
        }
      }
    }
    `

    return NextResponse.json({
      success: true,
      message: "Regras geradas com sucesso. Copie e aplique-as no console do Firebase.",
      firestoreRules,
      storageRules,
      instructions:
        "Acesse https://console.firebase.google.com, selecione seu projeto, vá para Firestore > Regras e Storage > Regras, e cole as regras correspondentes.",
    })
  } catch (error) {
    console.error("Error updating Firebase rules:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar regras do Firebase. Por favor, tente novamente mais tarde." },
      { status: 500 },
    )
  }
}
