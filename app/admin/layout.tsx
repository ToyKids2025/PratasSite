"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { onAuthChange } from "@/services/firebase"
import { PlusCircle, Upload, Database, PackageCheck, Clock, CheckCircle, BarChart3, Users, LogOut } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Skip auth check for login page
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setAuthenticated(true)
      } else {
        setAuthenticated(false)
        if (!isLoginPage) {
          router.push("/admin/login")
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, isLoginPage])

  // If on login page, just render children
  if (isLoginPage) {
    return children
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
      </div>
    )
  }

  // If not authenticated and not on login page, this will redirect (see useEffect)
  if (!authenticated) {
    return null
  }

  // User is authenticated, render admin layout
  return (
    <div className="min-h-screen bg-amber-50/50">
      <div className="bg-amber-50 border-b border-amber-100 py-3 px-4">
        <div className="container mx-auto flex flex-wrap items-center gap-4">
          <Link
            href="/admin/produtos/novo"
            className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <PlusCircle size={16} className="mr-1" /> Adicionar Produto
          </Link>
          <Link
            href="/admin/importar"
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Upload size={16} className="mr-1" /> Importar em Lote
          </Link>
          <Link
            href="/admin/produtos"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            <Database size={16} className="mr-1" /> Gerenciar Produtos
          </Link>
          <Link
            href="/admin/estoque"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            <PackageCheck size={16} className="mr-1" /> Controle de Estoque
          </Link>
          <Link
            href="/admin/vendas/pendentes"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            <Clock size={16} className="mr-1" /> Vendas Pendentes
          </Link>
          <Link
            href="/admin/vendas/confirmadas"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            <CheckCircle size={16} className="mr-1" /> Vendas Confirmadas
          </Link>
          <Link
            href="/admin/diagnostico"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            <BarChart3 size={16} className="mr-1" /> Diagnóstico
          </Link>
          <Link
            href="/admin/usuarios"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            <Users size={16} className="mr-1" /> Usuários Admin
          </Link>
          <button
            onClick={() => {
              const confirmLogout = window.confirm("Tem certeza que deseja sair?")
              if (confirmLogout) {
                import("@/services/firebase").then(({ logoutUser }) => {
                  logoutUser().then(() => {
                    router.push("/admin/login")
                  })
                })
              }
            }}
            className="ml-auto flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <LogOut size={16} className="mr-1" /> Sair
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}
