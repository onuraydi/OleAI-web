import { Button, Container } from "@/shared/ui"

export const CTA = () => {
  return (
    <section className="py-40 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/[0.02] -z-10" />
      <Container>
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold mb-10 leading-[1.1] tracking-tight">
            Harika bir şeyler pişirmeye <br />
            <span className="text-primary">hazır mısınız?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            Sıfır atık ile daha sağlıklı ve lezzetli öğünler yaratmak için 
            OleAI kullanan binlerce ev aşçısına katılın.
          </p>
          <Button size="lg" className="rounded-full px-16 bg-primary hover:bg-primary/90 text-white font-bold h-16 text-xl shadow-2xl shadow-primary/30">
            Şimdi Katılın
          </Button>
        </div>
      </Container>
    </section>
  )
}
