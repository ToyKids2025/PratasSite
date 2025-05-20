"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Trash2, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface Backup {
  id: string
  timestamp: Date
  date: string
  productCount: number
}

export default function Backups() {
  const { user, loading: authLoading } = useAuth()
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function loadBackups() {
      if (authLoading) return

      if (!user) {
        setError("Você precisa estar autenticado para acessar esta página.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/backups")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao carregar backups")
        }

        const data = await response.json()
        setBackups(data)
        setError(null)
      } catch (error: any) {
        console.error("Erro ao carregar backups:", error)
        setError(error.message || "Erro ao carregar backups. Por favor, tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadBackups()
  }, [user, authLoading])

  const handleCreateBackup = async () => {
    if (creating) return

    setCreating(true)
    setError(null)

    try {
      const response = await fetch("/api/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar backup")
      }

      const data = await response.json()

      // Recarregar a lista de backups
      const backupsResponse = await fetch("/api/backups")
      const backupsData = await backupsResponse.json()
      setBackups(backupsData)

      alert("Backup criado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao criar backup:", error)
      setError(error.message || "Erro ao criar backup. Por favor, tente novamente mais tarde.")
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteBackup = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este backup?")) return

    try {
      const response = await fetch(`/api/backups/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao excluir backup")
      }

      // Atualizar a lista de backups
      setBackups(backups.filter((backup) => backup.id !== id))
    } catch (error: any) {
      console.error("Erro ao excluir backup:", error)
      alert(`Erro ao excluir backup: ${error.message}`)
    }
  }

  const handleDownloadBackup = async (id: string) => {
    try {
      const response = await fetch(`/api/backups/${id}/download`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao baixar backup")
      }

      const data = await response.json()

      // Converter para JSON e fazer download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `backup_${id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error("Erro ao baixar backup:", error)
      alert(`Erro ao baixar backup: ${error.message}`)
    }
  }

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700">Você precisa estar autenticado para acessar esta página.</p>
              <p className="text-sm text-red-600 mt-1">Por favor, faça login para continuar.</p>
            </div>
          </div>
          <div className="text-center">
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Ir para página de login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-amber-800 hover:text-amber-600 transition-colors">
          <ArrowLeft size={18} className="mr-1" />
          Voltar para o painel
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-amber-800">Backups do Sistema</h1>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {creating ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" /> Criando...
              </>
            ) : (
              <>
                <RefreshCw size={18} className="mr-2" /> Criar Backup Agora
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-medium text-blue-800 mb-2">Sobre os Backups</h2>
          <p className="text-sm text-blue-700">
            O sistema realiza backups automáticos diariamente à meia-noite. Você também pode criar backups manuais a
            qualquer momento. Os backups incluem todos os produtos e suas configurações.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum backup encontrado. Clique em "Criar Backup Agora" para fazer seu primeiro backup.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Data
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Hora
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Produtos
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(backup.date).toLocaleDateString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(backup.timestamp).toLocaleTimeString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.id)}
                          className="flex items-center text-blue-600 hover:text-blue-900"
                        >
                          <Download size={16} className="mr-1" />
                          Baixar
                        </button>
                        <button
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="flex items-center text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
