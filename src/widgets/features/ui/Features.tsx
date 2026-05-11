import { Container, SectionHeading } from "@/shared/ui"
import { Package, ChefHat, ShoppingCart } from "lucide-react"

const features = [
  {
    title: "Akıllı Kiler",
    description: "Malzemelerinizi takip edin ve son kullanma tarihleri yaklaşmadan uyarı alın.",
    icon: <Package className="w-7 h-7 text-primary" />,
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "AI Şef Asistanı",
    description: "Elinizdeki malzemelere göre size özel kişiselleştirilmiş tarif önerileri.",
    icon: <ChefHat className="w-7 h-7 text-primary" />,
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    title: "Kusursuz Alışveriş",
    description: "Tüm cihazlarınızla senkronize olan, otomatik oluşturulan alışveriş listeleri.",
    icon: <ShoppingCart className="w-7 h-7 text-primary" />,
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
]

export const Features = () => {
  return (
    <section className="py-32 bg-secondary/60">
      <Container>
        <SectionHeading 
          title="Modern Aşçılar için Akıllı Araçlar" 
          className="mb-20"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-10 rounded-[2rem] bg-white dark:bg-card border border-border/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
