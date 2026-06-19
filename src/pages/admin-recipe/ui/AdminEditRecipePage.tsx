import { Footer } from '@/widgets/footer';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/entities/recipe/api/recipeApi';
import { AdminEditRecipeForm } from '@/features/admin-recipe/ui/AdminEditRecipeForm';
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { Loader2 } from 'lucide-react';

export function AdminEditRecipePage() {
  const { id } = useParams<{ id: string }>();

  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ["recipe-detail", id],
    queryFn: () => recipeApi.getRecipeById(id!),
    enabled: !!id
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="font-medium">Tarif yükleniyor...</p>
            </div>
          ) : isError || !recipe ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl flex flex-col items-center justify-center h-64 gap-3 border border-red-100 dark:border-red-900/30">
              <p className="font-bold text-lg">Tarif Bulunamadı</p>
              <p className="text-sm">İncelemek istediğiniz tarif sistemde mevcut değil veya silinmiş olabilir.</p>
            </div>
          ) : (
            <AdminEditRecipeForm initialData={recipe} />
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
}
