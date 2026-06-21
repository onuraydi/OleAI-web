import { Container } from "@/shared/ui"
import { Link } from "react-router-dom"

export const Footer = () => {
  return (
    <footer className="py-20 border-t border-border/50 bg-background">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-primary mb-3 tracking-tight">OleAI</h2>
            <p className="text-[15px] text-muted-foreground max-w-xs">
              © 2026 OleAI Inc. Tüm hakları saklıdır.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-[15px] font-semibold text-muted-foreground/80">
            <Link to="/privacy" className="hover:text-primary transition-colors">Gizlilik Politikası</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Kullanım Şartları</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">İletişim</Link>
            <Link to="/help" className="hover:text-primary transition-colors">Yardım</Link>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
