"use client"

import { useEffect, useState } from "react"
import { onAuthChange } from "@/services/firebase-auth"

export function AuthStatusBar() {
  const [isConnected, setIsConnected] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Verificar estado de autenticação usando onAuthChange para tempo real
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setIsConnected(!!user)
      setUserEmail(user?.email || null)
    })

    // Cleanup function
    return () => unsubscribe()
  }, [])

  if (!isConnected) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
        <div className="flex items-center">
          <span className="mr-2">❌</span>
          <span>Firebase desconectado – login necessário</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
      <div className="flex items-center">
        <span className="mr-2">✅</span>
        <span>Conectado com Firebase {userEmail ? `(${userEmail})` : ""}</span>
      </div>
    </div>
  )
}
