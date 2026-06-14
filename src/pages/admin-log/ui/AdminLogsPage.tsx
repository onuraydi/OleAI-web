import React from 'react';
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { ShieldAlert } from "lucide-react";
import { AdminLogsTable } from '@/widgets/admin-log';
import { motion } from "framer-motion";

export function AdminLogsPage() {
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
                  <ShieldAlert className="w-3 h-3" /> Sistem Logları
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Uygulama <span className="text-primary">Kayıtları</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-2 font-medium">
                Veritabanına kaydedilen tüm sistem loglarını, hataları ve uyarıları izleyin.
              </p>
            </div>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <AdminLogsTable />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
