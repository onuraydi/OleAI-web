import { Footer } from '@/widgets/footer';
import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { DietsTable } from "@/widgets/admin-diet";
import { CreateDietDialog } from "@/features/admin-diet";
import { motion } from "framer-motion";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { HeartPulse } from "lucide-react";

export const AdminDietsPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-2"
              >
                <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <HeartPulse className="w-3 h-3" /> Diyet ve Yaşam Tarzı
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Diyet <span className="text-primary">Tercihleri</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-2 font-medium">
                Kullanıcıların beslenme tarzlarını ve onlara özel reçete dışlama kurallarını yönetin.
              </p>
            </div>
            <div className="shrink-0 mb-2 flex items-center gap-3">
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md rounded-xl h-11 px-6">
                <HeartPulse className="w-4 h-4" />
                Yeni Diyet Ekle
              </Button>
            </div>
          </section>

          {/* Info Banner */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-700 dark:text-emerald-400">
              <strong>Not:</strong> Oluşturduğunuz diyet tercihleri kullanıcı profillerinde seçilebilir hale gelir. Bir diyet profilinde seçilen kategori veya malzemeler, bu diyeti kullanan kişilere tarif önerirken <strong>otomatik olarak dışlanır.</strong>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <DietsTable />
          </motion.div>
        </div>
        <Footer />
      </main>

      <CreateDietDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
      />
    </div>
  );
};
