import { Container, SectionHeading } from "@/shared/ui"
import { Package, ChefHat, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export const Features = () => {
  return (
    <section id="features" className="py-32 bg-secondary/60 relative">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading 
            title="Modern Aşçılar için Akıllı Araçlar" 
            className="mb-20"
          />
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="p-10 rounded-[2.5rem] bg-background/50 backdrop-blur-xl border border-border/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
