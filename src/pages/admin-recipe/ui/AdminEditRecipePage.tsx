import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/entities/recipe/api/recipeApi';
import { AdminEditRecipeForm } from '@/features/admin-recipe/ui/AdminEditRecipeForm';
import { DashboardPageLayout } from "@/shared/ui/layout/DashboardPageLayout";

export function AdminEditRecipePage() {
  const { id } = useParams<{ id: string }>();

  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ["recipe-detail", id],
    queryFn: () => recipeApi.getRecipeById(id!),
    enabled: !!id
  });

  return (
    <DashboardPageLayout 
      isLoading={isLoading} 
      isError={isError || !recipe}
      loadingMessage="Tarif yükleniyor..."
      errorMessage="Tarif Bulunamadı"
      errorDescription="İncelemek istediğiniz tarif sistemde mevcut değil veya silinmiş olabilir."
    >
      {recipe && <AdminEditRecipeForm initialData={recipe} />}
    </DashboardPageLayout>
  );
}
