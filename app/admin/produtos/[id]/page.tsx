"use client"

import type React from "react"
import { deleteImage } from "@/services/firebase" // Import deleteImage function
import { useNotification } from "@/components/notification"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Trash2, Plus, X, AlertCircle } from "lucide-react"
import { addProduct, updateProduct, deleteProduct } from "@/services/firebase"
import { useAuth } from "@/components/auth-provider"
// Substituir a importação do ImageUpload
import { ImageUploadSimple } from "@/components/image-upload-simple"
import type { ProductFormData } from "@/types/product"

// Lista de categorias disponíveis
const categorias = [
  { id: "anel", nome: "Anel" },
  { id: "brincos", nome: "Brincos" },
  { id: "pulseiras", nome: "Pulseiras" },
  { id: "tornozeleiras", nome: "Tornozeleiras" },
  { id: "gargantilhas", nome: "Gargantilhas" },
  { id: "pingentes", nome: "Pingentes" },
  { id: "berloques", nome: "Berloques" },
  { id: "acessorios", nome: "Acessórios" },
  { id: "antebraco", nome: "Antebraço" },
  { id: "infantil", nome: "Infantil" },
]

export default function ProductForm({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { showNotification } = useNotification()
  const isNewProduct = params.id === "novo"
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    originalPrice: 0,
    currentPrice: 0,
    description: "",
    images: [],
    category: "",
    features: [""],
    stock: 0,
    promotion: {
      active: false,
      endDate: null,
      discountPercentage: 0,
      badge: null,
      type: null,
    },
  })

  useEffect(() => {
    async function loadProduct() {
      if (authLoading) return

      if (!user) {
        setError("Você precisa estar autenticado para acessar esta página.")
        setLoading(false)
        return
      }

      if (!isNewProduct) {
        try {
          // Usar a API para buscar o produto
          const response = await fetch(`/api/products/${params.id}`)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Erro ao carregar produto")
          }

          const product = await response.json()

          if (product) {
            setFormData({
              id: product.id,
              name: product.name || "",
              originalPrice: product.originalPrice || 0,
              currentPrice: product.currentPrice || 0,
              description: product.description || "",
              images: product.images || [],
              category: product.category || "",
              features: product.features?.length ? product.features : [""],
              stock: product.stock || 0,
              promotion: product.promotion
                ? {
                    active: product.promotion.active || false,
                    endDate: product.promotion.endDate
                      ? new Date(product.promotion.endDate).toISOString().split("T")[0]
                      : null,
                    discountPercentage: product.promotion.discountPercentage || 0,
                    badge: product.promotion.badge || null,
                    type: product.promotion.type || null,
                  }
                : {
                    active: false,
                    endDate: null,
                    discountPercentage: 0,
                    badge: null,
                    type: null,
                  },
            })
          }
        } catch (error: any) {
          console.error("Erro ao carregar produto:", error)
          setError(error.message || "Erro ao carregar produto. Por favor, tente novamente mais tarde.")
        }
      }
      setLoading(false)
    }

    loadProduct()
  }, [isNewProduct, params.id, user, authLoading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name.startsWith("promotion.")) {
      const promotionField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        promotion: {
          ...prev.promotion!,
          [promotionField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target

    if (name === "promotion.active") {
      setFormData((prev) => ({
        ...prev,
        promotion: {
          ...prev.promotion!,
          active: checked,
        },
      }))
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numValue = value === "" ? 0 : Number(value)

    if (name.startsWith("promotion.")) {
      const promotionField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        promotion: {
          ...prev.promotion!,
          [promotionField]: numValue,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }))
    }
  }

  const handleImagesChange = (newImages: string[]) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }))
  }

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }))
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleFeatureChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newFeatures = [...prev.features]
      newFeatures[index] = value
      return {
        ...prev,
        features: newFeatures,
      }
    })
  }

  // Modificar a função handleSubmit para incluir tratamento de erros mais detalhado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Calculate discount percentage if not provided
      if (formData.promotion?.active && formData.promotion.discountPercentage === 0) {
        const discountPercentage = Math.round(
          ((formData.originalPrice - formData.currentPrice) / formData.originalPrice) * 100,
        )
        formData.promotion.discountPercentage = discountPercentage
      }

      // Remove empty features
      const cleanedFormData = {
        ...formData,
        features: formData.features.filter((feature) => feature.trim() !== ""),
      }

      console.log("Enviando dados do produto:", cleanedFormData)

      if (isNewProduct) {
        try {
          const productId = await addProduct(cleanedFormData)
          console.log("Produto adicionado com sucesso, ID:", productId)
          showNotification("Produto adicionado com sucesso!", "success")
          router.push("/admin/produtos")
        } catch (addError) {
          console.error("Erro específico ao adicionar produto:", addError)
          const errorMsg = addError instanceof Error ? addError.message : "Erro desconhecido ao adicionar produto"
          setError(`Erro ao adicionar produto: ${errorMsg}. Verifique as permissões do Firebase.`)
          showNotification(`Erro ao adicionar produto: ${errorMsg}`, "error")
        }
      } else {
        try {
          await updateProduct(params.id, cleanedFormData)
          console.log("Produto atualizado com sucesso")
          showNotification("Produto atualizado com sucesso!", "success")
          router.push("/admin/produtos")
        } catch (updateError) {
          console.error("Erro específico ao atualizar produto:", updateError)
          const errorMsg = updateError instanceof Error ? updateError.message : "Erro desconhecido ao atualizar produto"
          setError(`Erro ao atualizar produto: ${errorMsg}. Verifique as permissões do Firebase.`)
          showNotification(`Erro ao atualizar produto: ${errorMsg}`, "error")
        }
      }
    } catch (error: any) {
      console.error("Erro geral ao salvar produto:", error)
      const errorMsg = error.message || "Erro ao salvar produto. Por favor, tente novamente mais tarde."
      setError(`${errorMsg} (Verifique as permissões do Firebase)`)
      showNotification(errorMsg, "error")
      // Rolar para o topo para mostrar o erro
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        // Excluir imagens do Storage antes de excluir o produto
        for (const imageUrl of formData.images) {
          if (imageUrl.includes("firebasestorage.googleapis.com")) {
            try {
              await deleteImage(imageUrl)
            } catch (err) {
              console.error("Erro ao excluir imagem:", err)
              // Continuar mesmo se houver erro ao excluir imagem
            }
          }
        }

        await deleteProduct(params.id)
        showNotification("Produto excluído com sucesso!", "success")
        router.push("/admin/produtos")
      } catch (error: any) {
        console.error("Erro ao excluir produto:", error)
        const errorMsg = error.message || "Erro ao excluir produto. Por favor, tente novamente mais tarde."
        setError(errorMsg)
        showNotification(errorMsg, "error")
        // Rolar para o topo para mostrar o erro
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/produtos"
          className="flex items-center text-amber-800 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          Voltar para lista de produtos
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-amber-800 mb-6">
          {isNewProduct ? "Novo Produto" : "Editar Produto"}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Original (R$)</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleNumberChange}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Atual (R$)</label>
              <input
                type="number"
                name="currentPrice"
                value={formData.currentPrice}
                onChange={handleNumberChange}
                min="0"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleNumberChange}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagens</label>
            <p className="text-sm text-gray-500 mb-4">
              Adicione imagens do produto. Você pode fazer upload de arquivos, tirar fotos com a câmera ou inserir URLs.
            </p>
            {/* Substituir a referência ao componente ImageUpload por ImageUploadSimple */}
            <ImageUploadSimple
              images={formData.images}
              onChange={handleImagesChange}
              productId={isNewProduct ? "novo" : params.id}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="Característica do produto"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="ml-2 p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center text-sm text-amber-800 hover:text-amber-600"
            >
              <Plus size={16} className="mr-1" /> Adicionar característica
            </button>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-amber-800 mb-4">Configuração de Promoção</h2>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="promotion.active"
                  checked={formData.promotion?.active || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Produto em promoção</span>
              </label>
            </div>

            {formData.promotion?.active && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desconto (%)</label>
                    <input
                      type="number"
                      name="promotion.discountPercentage"
                      value={formData.promotion.discountPercentage}
                      onChange={handleNumberChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se deixado em 0, será calculado automaticamente com base nos preços
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de término</label>
                    <input
                      type="date"
                      name="promotion.endDate"
                      value={formData.promotion.endDate || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de promoção</label>
                    <select
                      name="promotion.type"
                      value={formData.promotion.type || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Nenhum</option>
                      <option value="new">Novo</option>
                      <option value="bestseller">Mais Vendido</option>
                      <option value="limited">Edição Limitada</option>
                      <option value="sale">Oferta Especial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Badge personalizado (opcional)
                    </label>
                    <input
                      type="text"
                      name="promotion.badge"
                      value={formData.promotion.badge || ""}
                      onChange={handleChange}
                      placeholder="Ex: Black Friday"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Se preenchido, substitui o tipo de promoção</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <div>
              {!isNewProduct && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  disabled={saving}
                >
                  <Trash2 size={18} className="mr-1" /> Excluir
                </button>
              )}
            </div>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-md hover:from-amber-600 hover:to-amber-700 transition-colors"
              disabled={saving}
            >
              <Save size={18} className="mr-1" />
              {saving ? "Salvando..." : "Salvar Produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
