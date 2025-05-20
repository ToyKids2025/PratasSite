import Link from "next/link"
import { Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Prata Girassol. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <nav className="flex items-center space-x-4 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Termos
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Privacidade
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              Contato
            </Link>
            <Link href="https://github.com" target="_blank" rel="noreferrer">
              <Github className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noreferrer">
              <Twitter className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              <span className="sr-only">Twitter</span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
