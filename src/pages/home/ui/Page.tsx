import { motion } from "framer-motion";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { PantryStatus } from "@/widgets/pantry-status/ui/PantryStatus";
import { RecipeFeed } from "@/widgets/recipe-feed/ui/RecipeFeed";
import { Sparkles, Bookmark, ShoppingCart } from "lucide-react";
import { useSessionStore } from "@/entities/session";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { Link } from "react-router-dom";

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
              className="mb-2"
            >
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Hoş geldin, <span className="text-primary">{user?.username || user?.email?.split('@')[0] || 'Şef'}!</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-3 font-medium">
                Bugün senin için harika tarif önerilerimiz var. Ne pişirmek istersin?
              </p>
            </motion.div>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                to="/recipes/create"
                className="p-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary text-white shadow-xl shadow-primary/20 flex flex-col gap-3 transition-transform hover:-translate-y-1 group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-black leading-tight">Bana Tarif Öner</p>
                  <p className="text-xs text-white/80 mt-1 font-medium">Dolabındakilerle</p>
                </div>
              </Link>
              
              <Link 
                to="/recipes/create"
                className="p-5 rounded-2xl bg-card border border-muted/30 hover:border-primary/50 shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <span className="text-2xl leading-none">+</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Yeni Ekle</p>
                  <p className="text-xs text-muted-foreground mt-1">Kendi tarifini yarat</p>
                </div>
              </Link>

              <Link 
                to="/profile"
                className="p-5 rounded-2xl bg-card border border-muted/30 hover:border-primary/50 shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Kaydedilenler</p>
                  <p className="text-xs text-muted-foreground mt-1">Favori tariflerin</p>
                </div>
              </Link>

              <Link 
                to="/shopping-list"
                className="p-5 rounded-2xl bg-card border border-muted/30 hover:border-primary/50 shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Alışveriş</p>
                  <p className="text-xs text-muted-foreground mt-1">Eksik malzemeler</p>
                </div>
              </Link>
            </div>
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
