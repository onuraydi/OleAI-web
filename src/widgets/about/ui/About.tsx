import { Container, SectionHeading } from "@/shared/ui"
import { Leaf, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export const About = () => {
  return (
    <section id="about" className="py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <SectionHeading 
              title="Mutfakta Yeni Bir Çağ" 
              className="text-left mb-8"
            />
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                OleAI, mutfakta israfı önlemek, sağlıklı beslenmeyi teşvik etmek ve yemek yapmayı
                herkes için zahmetsiz bir deneyime dönüştürmek amacıyla teknoloji ve gastronomi
                tutkunları tarafından kuruldu.
              </p>
              <p>
                Yapay zeka destekli altyapımız sayesinde sadece elinizdeki malzemeleri en iyi şekilde
                değerlendirmenizi sağlamakla kalmıyor, aynı zamanda size özel beslenme profilinize uygun 
                kişiselleştirilmiş tavsiyeler sunuyoruz. Amacımız evde yemek pişirmeyi bir yük olmaktan
                çıkarıp, keyifli ve sürdürülebilir bir alışkanlık haline getirmek.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="flex flex-col gap-2">
                <Leaf className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-bold">Sıfır İsraf</h4>
                <p className="text-sm text-muted-foreground">Malzemeleriniz asla boşa gitmez.</p>
              </div>
              <div className="flex flex-col gap-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-bold">Akıllı Yapay Zeka</h4>
                <p className="text-sm text-muted-foreground">Size özel tariflerle zaman kazanın.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-white/10 relative z-10 group">
              <img 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop" 
                alt="Modern mutfak ve aşçılık" 
                className="w-full h-auto object-cover aspect-[4/5] md:aspect-square group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary rounded-[2rem] -z-0" />
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
