import { motion } from "framer-motion";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { PantryStatus } from "@/widgets/pantry-status/ui/PantryStatus";
import { RecipeFeed } from "@/widgets/recipe-feed/ui/RecipeFeed";
import { Sparkles } from "lucide-react";
import { useSessionStore } from "@/entities/session";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";

export default function HomePage() {
  const user = useSessionStore((s) => s.user);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-8 space-y-12 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <section>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-2"
            >
              <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Akıllı Mutfak Asistanı
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Hoş geldin, <span className="text-primary">{user?.email?.split('@')[0] || 'Şef'}!</span>
            </h1>
            <p className="text-muted-foreground text-lg mt-2 font-medium">
              Dolabındakilerle bugün harika bir şeyler yaratmaya hazır mısın?
            </p>
          </section>

          {/* Pantry Status Summary */}
          <section>
            <ErrorBoundary>
              <PantryStatus />
            </ErrorBoundary>
          </section>

          {/* Recipe Recommendations */}
          <section className="pb-20">
            <ErrorBoundary>
              <RecipeFeed />
            </ErrorBoundary>
          </section>
        </div>
      </main>
    </div>
  );
}
