"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Copy, Check, ExternalLink, AlertCircle } from "lucide-react"
import { generateFirebaseRules } from "@/app/actions/firebase-rules"

export default function FirebaseSetup() {
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
        <h1 className="text-2xl font-semibold text-amber-800 mb-6">Configurar Firebase para Desenvolvimento</h1>

        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-medium">Erro detectado: Missing or insufficient permissions</p>
            <p className="text-sm text-red-600 mt-1">
              Este erro ocorre porque as regras de segurança do Firebase estão impedindo operações de escrita. Siga as
              instruções abaixo para resolver.
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h2 className="text-lg font-medium text-amber-800 mb-2">Instruções Passo a Passo</h2>
          <ol className="list-decimal pl-5 text-sm text-amber-700 space-y-3">
            <li>
              <strong>Acesse o Console do Firebase:</strong>
              <div className="mt-1">
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  Abrir Console do Firebase <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            </li>
            <li>
              <strong>Selecione seu projeto</strong> na lista de projetos.
            </li>
            <li>
              <strong>Configure as Regras do Firestore:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>No menu lateral, clique em "Firestore Database"</li>
                <li>Clique na aba "Regras"</li>
                <li>Clique no botão abaixo para gerar e copiar as regras</li>
                <li>Cole as regras no editor do console do Firebase</li>
                <li>Clique em "Publicar"</li>
              </ul>
            </li>
            <li>
              <strong>Configure as Regras do Storage:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>No menu lateral, clique em "Storage"</li>
                <li>Clique na aba "Regras"</li>
                <li>Cole as regras geradas no editor</li>
                <li>Clique em "Publicar"</li>
              </ul>
            </li>
            <li>
              <strong>Teste novamente</strong> a adição de produtos no seu aplicativo.
            </li>
          </ol>
        </div>

        <div className="mb-6">
          <button
            onClick={generateRules}
            disabled={loading}
            className="px-4 py-2 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Regras para Desenvolvimento"}
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
          <h2 className="text-lg font-medium text-blue-800 mb-2">⚠️ Importante: Apenas para Desenvolvimento</h2>
          <p className="text-sm text-blue-700">
            As regras geradas permitem acesso total ao Firestore e Storage, o que é adequado apenas para ambiente de
            desenvolvimento. Para produção, você deve implementar regras mais restritivas baseadas em autenticação e
            autorização.
          </p>
        </div>
      </div>
    </div>
  )
}
