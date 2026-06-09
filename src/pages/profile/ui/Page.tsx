import { motion } from "framer-motion";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { UserStatistics } from "@/widgets/user-statistics/ui/UserStatistics";
import { useSessionStore } from "@/entities/session";

export default function ProfilePage() {
  const user = useSessionStore((s) => s.user);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-8 space-y-12 max-w-7xl mx-auto w-full">
          {/* Profile Header */}
          <section className="flex items-center gap-6">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profil" 
                className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-neutral-900 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-primary/10 border-4 border-white dark:border-neutral-900 flex items-center justify-center text-primary font-black shadow-xl text-3xl">
                {(user?.username?.[0] || user?.email?.[0] || "Ş").toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-black text-foreground">
                {user?.username || user?.email?.split('@')[0]}
              </h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </section>

          {/* Statistics */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">İstatistiklerin</h2>
            <UserStatistics />
          </section>
        </div>
      </main>
    </div>
  );
}
