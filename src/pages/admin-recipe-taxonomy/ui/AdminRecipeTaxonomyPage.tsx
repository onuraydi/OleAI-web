import { useState } from 'react';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { DashboardHeader } from '@/widgets/dashboard-header/ui/DashboardHeader';
import { Tags, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { AdminRecipeCategoryTable } from '@/widgets/admin-recipe-taxonomy/ui/AdminRecipeCategoryTable';
import { AdminTagTable } from '@/widgets/admin-recipe-taxonomy/ui/AdminTagTable';
import { Button } from '@/shared/ui/button';
import { CreateRecipeCategoryDialog } from '@/widgets/admin-recipe-taxonomy/ui/CreateRecipeCategoryDialog';
import { CreateTagDialog } from '@/widgets/admin-recipe-taxonomy/ui/CreateTagDialog';

export const AdminRecipeTaxonomyPage = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500 relative z-0">
      {/* Premium Decorative Glow */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none -z-10" />

      <Sidebar />
      
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 mb-3"
              >
                <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 border border-primary/20 shadow-sm backdrop-blur-md">
                  <Tags className="w-3.5 h-3.5" /> Tarif Sınıflandırma
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Kategori ve <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Etiket Yönetimi</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-3 font-medium max-w-2xl">
                Uygulamanızdaki tüm tarifleri daha bulunabilir kılmak için kategorileri ve etiketleri yapılandırın.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              {activeTab === 'categories' ? (
                <Button onClick={() => setIsCreateCategoryOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl h-12 px-6 transition-all hover:scale-105 active:scale-95">
                  <Plus className="w-5 h-5" />
                  Yeni Kategori Ekle
                </Button>
              ) : (
                <Button onClick={() => setIsCreateTagOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl h-12 px-6 transition-all hover:scale-105 active:scale-95">
                  <Plus className="w-5 h-5" />
                  Yeni Etiket Ekle
                </Button>
              )}
            </div>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Premium Tabs Design */}
              <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-muted/50 p-1.5 rounded-2xl inline-flex shadow-sm mb-6">
                <TabsList className="bg-transparent h-11 w-full grid grid-cols-2 p-0 gap-1 w-[320px]">
                  <TabsTrigger 
                    value="categories" 
                    className="rounded-xl font-bold text-sm h-full data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                  >
                    Kategoriler
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tags" 
                    className="rounded-xl font-bold text-sm h-full data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                  >
                    Etiketler
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="categories" className="focus-visible:outline-none focus-visible:ring-0 mt-0 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-4 duration-500">
                <AdminRecipeCategoryTable />
              </TabsContent>

              <TabsContent value="tags" className="focus-visible:outline-none focus-visible:ring-0 mt-0 data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-4 duration-500">
                <AdminTagTable />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Shared Modals */}
      <CreateRecipeCategoryDialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen} />
      <CreateTagDialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen} />
    </div>
  );
};

