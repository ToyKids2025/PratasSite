"use client"

import { useEffect, useState } from "react"
import { isAuthenticated, getCurrentUser } from "@/services/firebase-auth"

export function AuthStatusBar() {
  const [isConnected, setIsConnected] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Verificar estado de autenticação periodicamente
  useEffect(() => {
    // Verificação inicial
    checkAuthStatus()

    // Verificar a cada 10 segundos
    const interval = setInterval(checkAuthStatus, 10000)

    return () => clearInterval(interval)
  }, [])

  // Função para verificar o status de autenticação
  const checkAuthStatus = () => {
    const authenticated = isAuthenticated()
    setIsConnected(authenticated)

    const user = getCurrentUser()
    setUserEmail(user?.email || null)
  }

  if (!isConnected) {
    return (
      <div className="bg-red-500 text-white py-2 px-4 text-center font-medium sticky top-0 z-50">
        ❌ Firebase desconectado – login necessário
      </div>
    )
  }

  return (
    <div className="bg-green-500 text-white py-2 px-4 text-center font-medium sticky top-0 z-50">
      ✅ Conectado com Firebase {userEmail ? `(${userEmail})` : ""}
    </div>
  )
}
