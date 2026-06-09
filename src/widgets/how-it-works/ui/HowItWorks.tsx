import { Container, SectionHeading } from "@/shared/ui"
import { motion } from "framer-motion"

const steps = [
  {
    number: "01",
    title: "Malzemelerinizi Ekleyin",
    description: "Elinizdeki malzemeleri hızlıca sisteme girin. Yapay zeka, eksik veya bitmek üzere olan ürünleri otomatik olarak takip eder."
  },
  {
    number: "02",
    title: "Yapay Zeka Analizi",
    description: "Gelişmiş AI motorumuz, elinizdeki malzemelere ve beslenme tercihlerinize en uygun, şef kalitesinde tarifleri saniyeler içinde oluşturur."
  },
  {
    number: "03",
    title: "Pişirin ve Tadını Çıkarın",
    description: "Adım adım talimatlarla yemeğinizi hazırlayın. Sıfır atık, maksimum lezzet ve pratikliğin keyfine varın."
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 bg-secondary/30 border-y border-border/50 relative overflow-hidden">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading 
            title="Nasıl Çalışır?" 
            className="mb-20"
          />
        </motion.div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
        >
          {/* Connector Line (Desktop only) */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
            className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-primary/20 z-0 origin-left" 
          />
          
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center text-3xl font-black text-primary mb-8 shadow-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:border-primary/40 transition-all duration-500">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
