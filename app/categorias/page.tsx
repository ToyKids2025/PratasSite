import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function Categorias() {
  // Lista de categorias com suas descrições
  const categorias = [
    {
      id: "anel",
      nome: "Anel",
      descricao: "Explore nossa coleção de anéis de prata",
    },
    {
      id: "brincos",
      nome: "Brincos",
      descricao: "Explore nossa coleção de brincos de prata",
    },
    {
      id: "pulseiras",
      nome: "Pulseiras",
      descricao: "Explore nossa coleção de pulseiras de prata",
    },
    {
      id: "tornozeleiras",
      nome: "Tornozeleiras",
      descricao: "Explore nossa coleção de tornozeleiras de prata",
    },
    {
      id: "gargantilhas",
      nome: "Gargantilhas",
      descricao: "Explore nossa coleção de gargantilhas de prata",
    },
    {
      id: "pingentes",
      nome: "Pingentes",
      descricao: "Explore nossa coleção de pingentes de prata",
    },
    {
      id: "berloques",
      nome: "Berloques",
      descricao: "Explore nossa coleção de berloques de prata",
    },
    {
      id: "acessorios",
      nome: "Acessórios",
      descricao: "Explore nossa coleção de acessórios de prata",
    },
    {
      id: "antebraco",
      nome: "Antebraço",
      descricao: "Explore nossa coleção de joias para antebraço",
    },
    {
      id: "infantil",
      nome: "Infantil",
      descricao: "Explore nossa coleção de joias infantis de prata",
    },
  ]

  return (
    <div className="min-h-screen bg-amber-50/50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <Link href="/" className="flex items-center text-amber-800 hover:text-amber-600 transition-colors">
            <ArrowLeft size={18} className="mr-1" />
            Voltar para Home
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-amber-800 mb-8 text-center">Categorias de Produtos</h1>

        <div className="mb-6">
          <Link
            href="/produtos"
            className="block w-full py-3 bg-amber-100 text-amber-800 font-medium text-center rounded-lg hover:bg-amber-200 transition-colors"
          >
            Ver Tudo
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categorias.map((categoria) => (
            <Link
              key={categoria.id}
              href={`/produtos?categoria=${categoria.id}`}
              className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-center"
            >
              <h2 className="text-lg font-medium text-amber-800">{categoria.nome}</h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
