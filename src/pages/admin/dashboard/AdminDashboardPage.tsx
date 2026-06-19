import { Footer } from '@/widgets/footer';
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import {
  StatCards,
  UserGrowthChart,
  RecentActivityTimeline,
  RecipeStatusChart,
  InteractionStats,
  DifficultyDistribution,
  AdminGlobalNotificationForm,
} from "@/widgets/admin-overview";
import { useAdminDashboardStats } from "@/entities/admin-dashboard";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const sectionVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as any },
  }),
};

export const AdminDashboardPage = () => {
  const { data: stats, isLoading } = useAdminDashboardStats();

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />

      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />

        <div className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* ── Header Section ── */}
          <section>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-2"
            >
              <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Sistem Kontrol Paneli
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-lg mt-2 font-medium">
              Sistem sağlığını, kullanıcı istatistiklerini ve son aktiviteleri
              buradan yönetin.
            </p>
          </section>

          {/* ── Row 1: Stat Cards (4 columns) ── */}
          <motion.section
            custom={0}
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
          >
            <StatCards stats={stats} isLoading={isLoading} />
          </motion.section>

          {/* ── Row 2: Growth Chart + Recipe Status ── */}
          <motion.section
            custom={1}
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <UserGrowthChart stats={stats} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-1">
              <RecipeStatusChart stats={stats} isLoading={isLoading} />
            </div>
          </motion.section>

          {/* ── Row 3: Interaction + Difficulty + Global Notification ── */}
          <motion.section
            custom={2}
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InteractionStats stats={stats} isLoading={isLoading} />
              <DifficultyDistribution stats={stats} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-1">
              <AdminGlobalNotificationForm />
            </div>
          </motion.section>

          {/* ── Row 4: Activity Timeline ── */}
          <motion.section
            custom={3}
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            className="pb-20"
          >
            <RecentActivityTimeline stats={stats} isLoading={isLoading} />
          </motion.section>
        </div>
        <Footer />
      </main>
    </div>
  );
};
