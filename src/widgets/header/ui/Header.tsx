import { Button, Container } from "@/shared/ui"
import { Link } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export const Header = () => {
  const { setTheme, theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40">
      <Container>
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
              OleAI
            </Link>
            <nav className="hidden md:block">
              <ul className="flex gap-8 text-[15px] font-medium text-muted-foreground">
                <li><Link to="/features" className="hover:text-primary transition-colors">Özellikler</Link></li>
                <li><Link to="/recipes" className="hover:text-primary transition-colors">Tarifler</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">Hakkımızda</Link></li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Tema değiştir</span>
            </Button>
            <Button className="rounded-full bg-primary hover:bg-primary/90 px-6 font-semibold" asChild>
              <Link to="/login">Giriş Yap</Link> 
            </Button>
          </div>
        </div>
      </Container>
    </header>
  )
}
