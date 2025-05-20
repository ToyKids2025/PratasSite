"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Camera, Upload, X, ImageIcon } from "lucide-react"
import { useNotification } from "./notification"

// Remover a importação de uploadImage e deleteImage do firebase
// import { uploadImage, deleteImage } from "@/services/firebase"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  productId?: string
}

export function ImageUpload({ images, onChange, productId = "new" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { showNotification } = useNotification()

  // Substituir a função handleFileChange para usar uma abordagem compatível com v0
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const newImages = [...images]

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Validar tipo de arquivo
        if (!file.type.startsWith("image/")) {
          const errorMsg = `O arquivo ${file.name} não é uma imagem válida.`
          setError(errorMsg)
          showNotification(errorMsg, "error")
          continue
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          const errorMsg = `O arquivo ${file.name} excede o tamanho máximo de 5MB.`
          setError(errorMsg)
          showNotification(errorMsg, "error")
          continue
        }

        // Em vez de fazer upload para o Firebase, vamos criar uma URL temporária
        // Isso é apenas para demonstração no ambiente v0
        const url = URL.createObjectURL(file)
        newImages.push(url)
        showNotification("Imagem adicionada com sucesso!", "success")
      }

      onChange(newImages)

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = ""
      }
    } catch (err: any) {
      console.error("Erro ao processar imagem:", err)
      const errorMsg = `Erro ao processar imagem: ${err.message}`
      setError(errorMsg)
      showNotification(errorMsg, "error")
    } finally {
      setUploading(false)
    }
  }

  // Substituir a função handleRemoveImage para não depender do Firebase
  const handleRemoveImage = async (index: number) => {
    try {
      // Remover da lista
      const newImages = [...images]
      newImages.splice(index, 1)
      onChange(newImages)
      showNotification("Imagem removida com sucesso!", "success")
    } catch (err: any) {
      console.error("Erro ao remover imagem:", err)
      const errorMsg = `Erro ao remover imagem: ${err.message}`
      setError(errorMsg)
      showNotification(errorMsg, "error")
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const triggerCameraInput = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative w-24 h-24 md:w-32 md:h-32">
            <img
              src={image || "/placeholder.svg"}
              alt={`Imagem ${index + 1}`}
              className="w-full h-full object-cover rounded-md border border-gray-300"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Placeholder para adicionar imagem */}
        <div
          onClick={triggerFileInput}
          className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <ImageIcon size={24} className="text-gray-400" />
          <span className="text-xs text-gray-500 mt-1">Adicionar</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={uploading}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Upload size={16} className="mr-1" />
          {uploading ? "Enviando..." : "Enviar Imagens"}
        </button>

        {/* Botão separado para câmera em dispositivos móveis */}
        <button
          type="button"
          onClick={triggerCameraInput}
          disabled={uploading}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Camera size={16} className="mr-1" />
          Usar Câmera
        </button>
      </div>

      {/* Input para arquivos */}
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

      {/* Input específico para câmera */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
