import Link from "next/link"
import { ArrowLeft, Search, RefreshCw, Download } from "lucide-react"

export default function ControleEstoque() {
  // Dados de exemplo para o estoque
  const produtosEstoque = [
    { id: 1, nome: "Anel de Prata 925", categoria: "Anel", estoque: 15, minimo: 5, status: "ok" },
    { id: 2, nome: "Brinco Argola Prata 925", categoria: "Brincos", estoque: 8, minimo: 5, status: "ok" },
    { id: 3, nome: "Colar Pingente Coração", categoria: "Pingentes", estoque: 3, minimo: 5, status: "baixo" },
    { id: 4, nome: "Pulseira com Zircônia", categoria: "Pulseiras", estoque: 0, minimo: 5, status: "esgotado" },
    { id: 5, nome: "Tornozeleira Prata 925", categoria: "Tornozeleiras", estoque: 6, minimo: 5, status: "ok" },
  ]

  return (
    <div className="min-h-screen bg-amber-50/50">
      <div className="bg-amber-50 border-b border-amber-100 py-3 px-4">
        <div className="container mx-auto flex flex-wrap items-center gap-4">
          <Link
            href="/admin/produtos/novo"
            className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <span className="mr-1">•</span> Adicionar Produto
          </Link>
          <Link
            href="/admin/importar"
            className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <span className="mr-1">•</span> Importar em Lote
          </Link>
          <Link
            href="/admin/produtos"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Gerenciar Produtos
          </Link>
          <Link
            href="/admin/estoque"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Controle de Estoque
          </Link>
          <Link
            href="/admin/vendas/pendentes"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Vendas Pendentes
          </Link>
          <Link
            href="/admin/vendas/confirmadas"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Vendas Confirmadas
          </Link>
          <Link
            href="/admin/diagnostico"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Diagnóstico
          </Link>
          <Link
            href="/admin/usuarios"
            className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            Usuários Admin
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="flex items-center text-amber-800 hover:text-amber-600 transition-colors">
            <ArrowLeft size={18} className="mr-1" />
            Voltar para o painel
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-amber-800 mb-8">Controle de Estoque</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <RefreshCw size={16} className="mr-2" />
                Atualizar
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                <Download size={16} className="mr-2" />
                Exportar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Produto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Categoria
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estoque Atual
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estoque Mínimo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
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
                {produtosEstoque.map((produto) => (
                  <tr key={produto.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{produto.categoria}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{produto.estoque}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{produto.minimo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          produto.status === "ok"
                            ? "bg-green-100 text-green-800"
                            : produto.status === "baixo"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {produto.status === "ok" ? "Normal" : produto.status === "baixo" ? "Baixo" : "Esgotado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                      <button className="text-red-600 hover:text-red-900">Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
