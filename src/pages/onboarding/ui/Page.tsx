import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui";
import { ArrowRight, Sparkles, Box, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import aiMagicImg from "@/shared/assets/onboarding/ai-magic.png";
import pantryImg from "@/shared/assets/onboarding/pantry-real.png";
import communityImg from "@/shared/assets/onboarding/community-real.png";

const steps = [
  {
    id: 1,
    title: "AI Mutfak Sihri",
    description: "Mutfağındaki malzemelere göre sana özel akıllı tarif önerileri al. OleAI, senin için en uygun lezzetleri saniyeler içinde keşfeder.",
    image: aiMagicImg,
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    badge: "Yapay Zeka",
    color: "bg-primary/10",
  },
  {
    id: 2,
    title: "Akıllı Dolabım",
    description: "Elindeki malzemeleri dijital dolabına ekle, son kullanma tarihlerini takip et ve israfı önle. Dolabında ne varsa, tarifinde o var!",
    image: pantryImg,
    icon: <Box className="w-6 h-6 text-primary" />,
    badge: "Dolabım",
    color: "bg-primary/10",
  },
  {
    id: 3,
    title: "Paylaş ve Keşfet",
    description: "Yemek tutkunları topluluğuna katıl. Kendi tariflerini paylaş, popüler trendleri takip et ve dünya mutfaklarından ilham al.",
    image: communityImg,
    icon: <Users className="w-6 h-6 text-primary" />,
    badge: "Topluluk",
    color: "bg-primary/10",
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/preferences");
    }
  };

  const skipOnboarding = () => {
    navigate("/preferences");
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden font-outfit transition-colors duration-500">
      {/* Background radial gradient decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent rounded-full opacity-40 dark:opacity-20" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          OleAI
        </div>
        <button 
          onClick={skipOnboarding}
          className="text-muted-foreground hover:text-primary font-medium transition-colors text-sm"
        >
          Geç
        </button>
      </header>

      {/* Content Area */}
      <div className="relative z-10 max-w-2xl w-full px-6 flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* Image Container */}
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] opacity-40 -z-10" />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-white dark:border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)]"
              >
                <img 
                  src={steps[currentStep].image} 
                  alt=""
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                />
              </motion.div>
              
              {/* Floating Badge */}
              <motion.div 
                initial={{ scale: 0, rotate: -20, y: 20 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                className="absolute -bottom-4 right-8 bg-card p-4 rounded-2xl shadow-xl flex items-center gap-2 border border-primary/10 dark:border-white/5 backdrop-blur-sm"
              >
                {steps[currentStep].icon}
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  {steps[currentStep].badge}
                </span>
              </motion.div>
            </div>

            {/* Text Content - Staggered */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            >
              {steps[currentStep].title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-muted-foreground dark:text-neutral-400 text-lg md:text-xl leading-relaxed max-w-md mx-auto"
            >
              {steps[currentStep].description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="mt-16 w-full flex flex-col items-center gap-10">
          {/* Progress Indicators */}
          <div className="flex gap-3" role="tablist" aria-label="Onboarding adımları">
            {steps.map((_, index) => (
              <motion.button
                key={index}
                role="tab"
                aria-selected={index === currentStep}
                aria-label={`Adım ${index + 1}`}
                animate={{
                  width: index === currentStep ? 32 : 10,
                  backgroundColor: index === currentStep ? "#4b6043" : "#d1d5db"
                }}
                whileHover={{ scale: 1.2 }}
                className={`h-2.5 rounded-full transition-colors duration-300 ${
                  index !== currentStep ? "dark:bg-neutral-800" : ""
                }`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>

          {/* Next Button */}
          <Button 
            onClick={nextStep}
            className="w-full max-w-sm h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xl shadow-[0_20px_40px_-10px_rgba(75,96,67,0.3)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] group transition-all active:scale-95"
          >
            {currentStep === steps.length - 1 ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center"
              >
                Hadi Başlayalım! <Sparkles className="ml-2 w-5 h-5 animate-pulse" />
              </motion.span>
            ) : (
              <span className="flex items-center">
                Sıradaki <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 dark:bg-primary/2 rounded-full blur-3xl" />
    </div>
  );
}
