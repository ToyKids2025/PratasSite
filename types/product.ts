export interface ProductPromotion {
  active: boolean
  endDate: Date | null
  discountPercentage: number
  badge?: string | null
  type?: "new" | "bestseller" | "limited" | "sale" | null
}

export interface Product {
  id: string
  name: string
  originalPrice: number
  currentPrice: number
  description: string
  images: string[]
  category: string
  features: string[]
  stock: number
  promotion: ProductPromotion | null
  createdAt: Date
  updatedAt: Date
}

export interface ProductFormData {
  id?: string
  name: string
  originalPrice: number
  currentPrice: number
  description: string
  images: string[]
  category: string
  features: string[]
  stock: number
  promotion: {
    active: boolean
    endDate: string | null
    discountPercentage: number
    badge: string | null
    type: "new" | "bestseller" | "limited" | "sale" | null
  } | null
}
