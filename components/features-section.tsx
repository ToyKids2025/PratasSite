import type React from "react"
import { CheckCircle, Code, Layers, Zap } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  // Traduzir a seção de recursos
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Recursos</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Tudo o que você precisa para construir aplicações modernas
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Nossa plataforma fornece todas as ferramentas e recursos necessários para criar aplicações impressionantes
              e de alto desempenho com facilidade.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-12">
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-primary" />}
            title="Extremamente Rápido"
            description="Construído com Next.js para desempenho ideal e SEO pronto para uso."
          />
          <FeatureCard
            icon={<Layers className="h-10 w-10 text-primary" />}
            title="Baseado em Componentes"
            description="Arquitetura modular com componentes reutilizáveis para desenvolvimento rápido."
          />
          <FeatureCard
            icon={<Code className="h-10 w-10 text-primary" />}
            title="Experiência do Desenvolvedor"
            description="Suporte a TypeScript, recarga automática e APIs intuitivas para um fluxo de trabalho tranquilo."
          />
          <FeatureCard
            icon={<CheckCircle className="h-10 w-10 text-primary" />}
            title="Pronto para Produção"
            description="Otimizado para implantação com otimizações de desempenho integradas."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        {icon}
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
