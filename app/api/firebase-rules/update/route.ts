import { NextResponse } from "next/server"
import admin from "firebase-admin"

// Inicializar o Firebase Admin se ainda não estiver inicializado
let app: admin.app.App
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined

    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    })
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação (em um ambiente real, você usaria um token de API)
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get("key")

    if (apiKey !== process.env.BACKUP_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Atualizar regras do Firestore
    const firestoreRules = `
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Permitir acesso de leitura e escrita a todos os produtos
        match /products/{productId} {
          allow read, write: if true;
        }
        
        // Permitir acesso aos backups
        match /backups/{backupId} {
          allow read, write: if true;
        }
      }
    }
    `

    // Atualizar regras do Storage
    const storageRules = `
    rules_version = '2';
    service firebase.storage {
      match /b/{bucket}/o {
        // Permitir acesso de leitura e escrita a todos os arquivos
        match /{allPaths=**} {
          allow read, write: if true;
        }
      }
    }
    `

    // Em um ambiente real, você usaria a API do Firebase para atualizar as regras
    // Aqui, apenas retornamos as regras para que você possa copiá-las e aplicá-las manualmente
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
