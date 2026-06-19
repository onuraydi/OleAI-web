import { Footer } from '@/widgets/footer';
import React from 'react';
import { AdminRecipesTable, AdminDeletedRecipesTable } from '@/widgets/admin-recipe';
import { ChefHat, AlertCircle, CheckSquare, List, Trash2 } from 'lucide-react';
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function AdminRecipesPage() {
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
                  <ChefHat className="w-3 h-3" /> Tarif Yönetimi
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Topluluk <span className="text-primary">Tarifleri</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-2 font-medium">
                Platformdaki tüm tarifleri buradan yönetebilirsiniz. Yeni tarifleri inceleyip onaylayabilir veya reddedebilirsiniz.
              </p>
            </div>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-muted/30 p-1.5 rounded-[1.5rem] h-auto mb-8 gap-2">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3.5 flex gap-2 font-bold transition-all">
                  <List className="w-5 h-5" /> Tüm Tarifler
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-[#FF9800] data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3.5 flex gap-2 font-bold transition-all">
                  <AlertCircle className="w-5 h-5" /> Onay Bekleyenler
                </TabsTrigger>
                <TabsTrigger value="published" className="data-[state=active]:bg-[#2196F3] data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3.5 flex gap-2 font-bold transition-all">
                  <CheckSquare className="w-5 h-5" /> Yayınlananlar
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-[#F44336] data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3.5 flex gap-2 font-bold transition-all">
                  <AlertCircle className="w-5 h-5" /> Reddedilenler
                </TabsTrigger>
                <TabsTrigger value="trash" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-2xl py-3.5 flex gap-2 font-bold transition-all">
                  <Trash2 className="w-5 h-5" /> Çöp Kutusu
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0 focus-visible:outline-none">
                <AdminRecipesTable />
              </TabsContent>

              <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
                <AdminRecipesTable fixedStatus="PendingAdminApproval" />
              </TabsContent>

              <TabsContent value="published" className="mt-0 focus-visible:outline-none">
                <AdminRecipesTable fixedStatus="Published" />
              </TabsContent>

              <TabsContent value="rejected" className="mt-0 focus-visible:outline-none">
                <AdminRecipesTable fixedStatus="Rejected" />
              </TabsContent>

              <TabsContent value="trash" className="mt-0 focus-visible:outline-none">
                <AdminDeletedRecipesTable />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
