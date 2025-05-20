"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react"
import { generateFirebaseRules } from "@/app/actions/firebase-rules"

export default function ConfigurarFirebase() {
  const [copied, setCopied] = useState({ firestore: false, storage: false })
  const [loading, setLoading] = useState(false)
  const [rules, setRules] = useState<{ firestoreRules: string; storageRules: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateRules = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await generateFirebaseRules()

      if (!result.success) {
        throw new Error(result.error || "Erro ao gerar regras")
      }

      setRules({
        firestoreRules: result.firestoreRules,
        storageRules: result.storageRules,
      })
    } catch (error) {
      console.error("Erro ao gerar regras:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido ao gerar regras")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: "firestore" | "storage") => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ ...copied, [type]: true })
      setTimeout(() => setCopied({ ...copied, [type]: false }), 2000)
    })
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
        <h1 className="text-2xl font-semibold text-amber-800 mb-6">Configurar Regras do Firebase</h1>

        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h2 className="text-lg font-medium text-amber-800 mb-2">Instruções</h2>
          <p className="text-sm text-amber-700 mb-4">
            Para resolver o erro "Missing or insufficient permissions", você precisa configurar as regras de segurança
            do Firebase. Siga os passos abaixo:
          </p>
          <ol className="list-decimal pl-5 text-sm text-amber-700 space-y-2">
            <li>Clique no botão "Gerar Regras" abaixo</li>
            <li>Copie as regras geradas para o Firestore e Storage</li>
            <li>
              Acesse o{" "}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                Console do Firebase <ExternalLink size={14} className="ml-1" />
              </a>
            </li>
            <li>Selecione seu projeto</li>
            <li>Vá para Firestore Database &gt; Regras e cole as regras do Firestore</li>
            <li>Vá para Storage &gt; Regras e cole as regras do Storage</li>
            <li>Clique em "Publicar" em ambas as páginas</li>
          </ol>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={generateRules}
            disabled={loading}
            className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Regras"}
          </button>
        </div>

        {rules && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-700">Regras do Firestore</h3>
                <button
                  onClick={() => copyToClipboard(rules.firestoreRules, "firestore")}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  {copied.firestore ? (
                    <>
                      <Check size={16} className="mr-1" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-1" /> Copiar
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">{rules.firestoreRules}</pre>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-700">Regras do Storage</h3>
                <button
                  onClick={() => copyToClipboard(rules.storageRules, "storage")}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  {copied.storage ? (
                    <>
                      <Check size={16} className="mr-1" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-1" /> Copiar
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">{rules.storageRules}</pre>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-medium text-blue-800 mb-2">Solução Alternativa</h2>
          <p className="text-sm text-blue-700">
            Se você continuar enfrentando problemas com as permissões, você pode adicionar produtos diretamente pelo
            console do Firebase:
          </p>
          <ol className="list-decimal pl-5 text-sm text-blue-700 mt-2 space-y-1">
            <li>
              Acesse o{" "}
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                Console do Firebase <ExternalLink size={14} className="ml-1" />
              </a>
            </li>
            <li>Selecione seu projeto</li>
            <li>Vá para Firestore Database</li>
            <li>Crie uma coleção chamada "products" se ainda não existir</li>
            <li>Adicione um novo documento com os campos necessários</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
