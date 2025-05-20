"use client"

import { useState } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { useCart, type CartItem } from "./floating-cart"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image: string
  }
  variant?: "primary" | "secondary"
  className?: string
}

export function AddToCartButton({ product, variant = "primary", className = "" }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    }

    addItem(cartItem)
    setAdded(true)

    // Reset the added state after 2 seconds
    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`flex items-center justify-center transition-all duration-300 ${
        variant === "primary"
          ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
          : "border border-amber-700 text-amber-800 hover:bg-amber-50"
      } ${className}`}
      disabled={added}
    >
      {added ? (
        <>
          <Check size={18} className="mr-1" /> Adicionado
        </>
      ) : (
        <>
          <ShoppingCart size={18} className="mr-1" /> Adicionar
        </>
      )}
    </button>
  )
}
