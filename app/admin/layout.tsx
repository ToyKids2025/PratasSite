import type React from "react"
import { AuthStatusBar } from "@/components/auth-status-bar"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="text-xl font-bold">
              Painel Administrativo
            </Link>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/admin/produtos" className="hover:text-gray-300">
                    Produtos
                  </Link>
                </li>
                <li>
                  <Link href="/admin/vendas/pendentes" className="hover:text-gray-300">
                    Vendas Pendentes
                  </Link>
                </li>
                <li>
                  <Link href="/admin/vendas/confirmadas" className="hover:text-gray-300">
                    Vendas Confirmadas
                  </Link>
                </li>
                <li>
                  <Link href="/admin/estoque" className="hover:text-gray-300">
                    Estoque
                  </Link>
                </li>
                <li>
                  <Link href="/admin/usuarios" className="hover:text-gray-300">
                    Usuários
                  </Link>
                </li>
                <li>
                  <Link href="/admin/backups" className="hover:text-gray-300">
                    Backups
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-gray-300">
                    Login
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="container mx-auto">
          <AuthStatusBar />
          {children}
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} Flor de Girassol Pratas - Painel Administrativo</p>
        </div>
      </footer>
    </div>
  )
}
