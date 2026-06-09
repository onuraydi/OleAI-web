import { useState } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { Database, Tags, LayoutDashboard } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CategoriesTable } from "@/widgets/admin-category/ui/CategoriesTable";
import { CreateCategoryDialog } from "@/features/admin-category/ui/CreateCategoryDialog";
import { EditCategoryDialog } from "@/features/admin-category/ui/EditCategoryDialog";
import { DeleteCategoryDialog } from "@/features/admin-category/ui/DeleteCategoryDialog";
import type { Category } from "@/entities/admin-category/model/types";
import { motion } from "framer-motion";

export const AdminCategoriesPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

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
                  <Tags className="w-3 h-3" /> Kategori Yönetimi
                </div>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Malzeme <span className="text-primary">Kategorileri</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-2 font-medium">
                Uygulamada kullanılacak malzeme kategorilerini ve ikonlarını yönetin.
              </p>
            </div>
            <div className="shrink-0 mb-2 flex items-center gap-3">
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md rounded-xl h-11 px-6">
                <Tags className="w-4 h-4" />
                Yeni Kategori Ekle
              </Button>
            </div>
          </section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <CategoriesTable onEdit={handleEdit} onDelete={handleDelete} />
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <CreateCategoryDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      
      <EditCategoryDialog 
        category={selectedCategory} 
        isOpen={isEditOpen} 
        onClose={() => {
          setIsEditOpen(false);
          setTimeout(() => setSelectedCategory(null), 300);
        }} 
      />
      
      <DeleteCategoryDialog 
        category={selectedCategory} 
        isOpen={isDeleteOpen} 
        onClose={() => {
          setIsDeleteOpen(false);
          setTimeout(() => setSelectedCategory(null), 300);
        }} 
      />
    </div>
  );
};
