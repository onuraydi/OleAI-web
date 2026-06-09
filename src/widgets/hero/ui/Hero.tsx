import { Button, Container } from "@/shared/ui"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export const Hero = () => {
  return (
    <section className="py-24 md:py-32 overflow-hidden bg-background relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl text-center lg:text-left"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 leading-[1.1]">
              Yemek Yapmayı <br /> 
              <span className="text-primary relative">
                Yapay Zeka
                <span className="absolute -bottom-2 left-0 w-full h-2 bg-primary/20 rounded-full" />
              </span> ile <br />
              Zirveye Taşıyın
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              OleAI ile mutfağınızdaki malzemeleri şef kalitesinde öğünlere dönüştürün. 
              Akıllı yönetim, anında tarifler ve sağlıklı yaşam.
            </p>
            <Button asChild size="lg" className="rounded-full px-10 bg-primary hover:bg-primary/90 text-white font-bold h-14 text-lg shadow-lg shadow-primary/30 transition-all hover:scale-105">
              <Link to="/register">Ücretsiz Başlayın</Link>
            </Button>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white/50 dark:border-white/10 relative z-10">
              <img 
                src="/hero-kitchen.png" 
                alt="Modern mutfak ve taze malzemeler" 
                className="w-full h-auto object-cover aspect-[4/3] hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
