"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { getPromotedProducts } from "@/services/firebase"
import type { Product } from "@/types/product"

export default function FullHome() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const products = await getPromotedProducts()
        setFeaturedProducts(products)
        setError(null)
      } catch (err) {
        console.error("Error loading products:", err)
        setError("Erro ao carregar produtos")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Produtos em Destaque
          </h2>

          {loading ? (
            <div className="text-center">Carregando produtos...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center">Nenhum produto em destaque disponível no momento.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Link
              href="/produtos"
              className="inline-flex h-10 items-center justify-center rounded-md bg-amber-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-700"
            >
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  )
}
