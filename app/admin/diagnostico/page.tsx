"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, getCurrentToken } from "@/services/firebase-auth"
import { checkFirebaseConfig } from "@/services/firebase-config"

export default function DiagnosticoPage() {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        // Verificar configuração
        const config = checkFirebaseConfig()
        setConfigStatus(config)

        // Verificar usuário atual
        const currentUser = getCurrentUser()
        setUser(
          currentUser
            ? {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                emailVerified: currentUser.emailVerified,
                isAnonymous: currentUser.isAnonymous,
                metadata: {
                  creationTime: currentUser.metadata.creationTime,
                  lastSignInTime: currentUser.metadata.lastSignInTime,
                },
              }
            : null,
        )

        // Obter token atual
        if (currentUser) {
          const idToken = await getCurrentToken()
          setToken(idToken)
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const refreshToken = async () => {
    try {
      setLoading(true)
      const newToken = await getCurrentToken()
      setToken(newToken)
      setError(null)
    } catch (err) {
      console.error("Erro ao renovar token:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico do Firebase</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {error && (
            <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
              <h2 className="font-bold">Erro:</h2>
              <p>{error}</p>
            </div>
          )}

          {/* Status da Configuração */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Configuração do Firebase</h2>
            {configStatus && (
              <div>
                <div
                  className={`mb-2 p-2 rounded ${configStatus.isComplete ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  Status: {configStatus.isComplete ? "Completa ✅" : "Incompleta ❌"}
                </div>

                <h3 className="font-medium mt-4 mb-2">Detalhes:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(configStatus.status).map(([key, value]: [string, any]) => (
                    <li key={key} className={value ? "text-green-600" : "text-red-600"}>
                      {key}: {value ? "✅" : "❌"}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Status do Usuário */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Status do Usuário</h2>
            {user ? (
              <div>
                <div className="mb-2 p-2 rounded bg-green-100 text-green-800">Autenticado ✅</div>

                <h3 className="font-medium mt-4 mb-2">Detalhes do Usuário:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>UID: {user.uid}</li>
                  <li>Email: {user.email}</li>
                  <li>Nome: {user.displayName || "Não definido"}</li>
                  <li>Email verificado: {user.emailVerified ? "Sim ✅" : "Não ❌"}</li>
                  <li>Anônimo: {user.isAnonymous ? "Sim" : "Não"}</li>
                  <li>Criado em: {user.metadata?.creationTime}</li>
                  <li>Último login: {user.metadata?.lastSignInTime}</li>
                </ul>
              </div>
            ) : (
              <div className="mb-2 p-2 rounded bg-red-100 text-red-800">Não autenticado ❌</div>
            )}
          </div>

          {/* Status do Token */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Token de Autenticação</h2>
            {token ? (
              <div>
                <div className="mb-2 p-2 rounded bg-green-100 text-green-800">Token obtido com sucesso ✅</div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Token (primeiros 20 caracteres):</h3>
                  <div className="p-2 bg-gray-100 rounded font-mono text-sm overflow-x-auto">
                    {token.substring(0, 20)}...
                  </div>

                  <button
                    onClick={refreshToken}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    disabled={loading}
                  >
                    {loading ? "Renovando..." : "Renovar Token"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2 p-2 rounded bg-red-100 text-red-800">Token não disponível ❌</div>

                {user && (
                  <button
                    onClick={refreshToken}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    disabled={loading}
                  >
                    {loading ? "Obtendo..." : "Obter Token"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Instruções para Resolução de Problemas</h2>

            <ol className="list-decimal pl-5 space-y-3">
              <li>
                <strong>Verifique a configuração do Firebase:</strong> Certifique-se de que todas as variáveis de
                ambiente estão configuradas corretamente.
              </li>
              <li>
                <strong>Verifique o status de autenticação:</strong> Se não estiver autenticado, faça login novamente.
              </li>
              <li>
                <strong>Verifique o token:</strong> Se o token não estiver disponível, tente renovar ou fazer login
                novamente.
              </li>
              <li>
                <strong>Verifique as regras do Firestore:</strong> Certifique-se de que as regras permitem acesso para
                usuários autenticados.
              </li>
              <li>
                <strong>Limpe o cache do navegador:</strong> Em alguns casos, problemas de autenticação podem ser
                resolvidos limpando o cache.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
