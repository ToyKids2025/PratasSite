import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <HeroSection />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Produtos em Destaque
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Placeholder para produtos */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
                <Image src="/silver-product.png" alt="Produto de Prata" fill className="object-cover" />
              </div>
              <h3 className="text-lg font-semibold">Carregando produtos...</h3>
              <p className="text-sm text-gray-500">Aguarde enquanto carregamos os produtos</p>
            </div>
          </div>

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
