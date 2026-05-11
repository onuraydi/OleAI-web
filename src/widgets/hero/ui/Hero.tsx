import { Button, Container } from "@/shared/ui"

export const Hero = () => {
  return (
    <section className="py-24 md:py-32 overflow-hidden bg-background">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8 leading-[1.1]">
              Yemek Yapmayı <br /> 
              <span className="text-primary">Yapay Zeka</span> ile <br />
              Zirveye Taşıyın
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              OleAI ile mutfağınızdaki malzemeleri şef kalitesinde öğünlere dönüştürün. 
              Akıllı yönetim, anında tarifler ve sağlıklı yaşam.
            </p>
            <Button size="lg" className="rounded-full px-10 bg-primary hover:bg-primary/90 text-white font-bold h-14 text-lg shadow-lg shadow-primary/20">
              Ücretsiz Başlayın
            </Button>
          </div>
          <div className="relative">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white/50 dark:border-white/10">
              <img 
                src="/hero-kitchen.png" 
                alt="Modern mutfak ve taze malzemeler" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          </div>
        </div>
      </Container>
    </section>
  )
}
