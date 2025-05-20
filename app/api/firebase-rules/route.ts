import { NextResponse } from "next/server"

export async function GET(request: Request) {
  // Esta é apenas uma rota informativa para mostrar as regras recomendadas
  // Você precisará configurar essas regras no console do Firebase

  const storageRules = `
  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      // Permitir acesso de leitura a todos os arquivos
      match /{allPaths=**} {
        allow read;
      }
      
      // Permitir upload e exclusão apenas para usuários autenticados
      match /products/{productId}/{fileName} {
        allow write, delete: if request.auth != null;
      }
    }
  }
  `

  const firestoreRules = `
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Permitir acesso de leitura a todos os produtos
      match /products/{productId} {
        allow read;
        allow write, delete: if request.auth != null;
      }
      
      // Permitir acesso aos backups apenas para usuários autenticados
      match /backups/{backupId} {
        allow read, write, delete: if request.auth != null;
      }
    }
  }
  `

  return NextResponse.json({
    message: "Regras de segurança recomendadas para o Firebase",
    storageRules,
    firestoreRules,
    instructions: "Configure estas regras no console do Firebase para corrigir problemas de permissão.",
  })
}
