"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginWithEmailPassword } from "@/services/firebase-auth"
import { checkFirebaseConfig } from "@/services/firebase-config"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const router = useRouter()

  // Verificar configuração do Firebase ao carregar
  useState(() => {
    const status = checkFirebaseConfig()
    setConfigStatus(status)

    if (!status.isComplete) {
      setError("Configuração do Firebase incompleta. Verifique as variáveis de ambiente.")
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await loginWithEmailPassword(email, password)
      console.log("Login bem-sucedido, redirecionando...")
      router.push("/admin")
    } catch (err: any) {
      console.error("Erro no login:", err)

      // Mensagens de erro mais amigáveis
      if (err.code === "auth/invalid-credential") {
        setError("Email ou senha incorretos. Por favor, tente novamente.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Muitas tentativas de login. Por favor, tente novamente mais tarde.")
      } else if (err.code === "auth/network-request-failed") {
        setError("Erro de conexão. Verifique sua internet e tente novamente.")
      } else {
        setError(`Erro ao fazer login: ${err.message || "Erro desconhecido"}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50/30 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-amber-800">Login Administrativo</h1>

        {configStatus && !configStatus.isComplete && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            <p className="font-bold">Configuração do Firebase incompleta:</p>
            <ul className="list-disc pl-5 mt-1">
              {Object.entries(configStatus.status).map(
                ([key, value]: [string, any]) => !value && <li key={key}>{key} não configurado</li>,
              )}
            </ul>
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            Esta área é restrita para administradores da loja. Se você é cliente, por favor retorne à{" "}
            <a href="/" className="text-amber-600 hover:text-amber-800">
              página inicial
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
