import Link from "next/link"
import { ArrowLeft, Search, Filter, CheckCircle, XCircle } from "lucide-react"

export default function VendasPendentes() {
  // Dados de exemplo para vendas pendentes
  const vendasPendentes = [
    {
      id: "PED-001",
      cliente: "Maria Silva",
      data: "15/05/2025",
      valor: 299.9,
      status: "aguardando_pagamento",
      itens: 3,
    },
    {
      id: "PED-002",
      cliente: "João Santos",
      data: "16/05/2025",
      valor: 150.5,
      status: "pagamento_aprovado",
      itens: 1,
    },
    {
      id: "PED-003",
      cliente: "Ana Oliveira",
      data: "16/05/2025",
      valor: 450.0,
      status: "separando",
      itens: 4,
    },
    {
      id: "PED-004",
      cliente: "Carlos Pereira",
      data: "17/05/2025",
      valor: 199.9,
      status: "enviado",
      itens: 2,
    },
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

        <h1 className="text-2xl font-semibold text-amber-800 mb-8">Vendas Pendentes</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar pedidos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                <Filter size={16} className="mr-2" />
                Filtrar
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
                    Pedido
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cliente
                  </th>
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
                    Valor
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
                {vendasPendentes.map((venda) => (
                  <tr key={venda.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{venda.id}</div>
                      <div className="text-xs text-gray-500">{venda.itens} itens</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{venda.cliente}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{venda.data}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        R$ {venda.valor.toFixed(2).replace(".", ",")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          venda.status === "aguardando_pagamento"
                            ? "bg-yellow-100 text-yellow-800"
                            : venda.status === "pagamento_aprovado"
                              ? "bg-green-100 text-green-800"
                              : venda.status === "separando"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {venda.status === "aguardando_pagamento"
                          ? "Aguardando Pagamento"
                          : venda.status === "pagamento_aprovado"
                            ? "Pagamento Aprovado"
                            : venda.status === "separando"
                              ? "Separando"
                              : "Enviado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">Detalhes</button>
                        <button className="flex items-center text-green-600 hover:text-green-900">
                          <CheckCircle size={16} className="mr-1" />
                          Aprovar
                        </button>
                        <button className="flex items-center text-red-600 hover:text-red-900">
                          <XCircle size={16} className="mr-1" />
                          Cancelar
                        </button>
                      </div>
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
