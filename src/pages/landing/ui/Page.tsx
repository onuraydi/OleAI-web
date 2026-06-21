import { Header } from "@/widgets/header"
import { Hero } from "@/widgets/hero"
import { Features } from "@/widgets/features"
import { HowItWorks } from "@/widgets/how-it-works"
import { About } from "@/widgets/about"
import { Stats } from "@/widgets/stats"
import { CTA } from "@/widgets/cta"
import { Footer } from "@/widgets/footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <About />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
