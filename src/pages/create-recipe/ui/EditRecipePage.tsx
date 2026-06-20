import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recipeApi } from '@/entities/recipe/api/recipeApi';
import { EditRecipeForm } from '@/features/create-recipe/ui/EditRecipeForm';
import { DashboardPageLayout } from "@/shared/ui/layout/DashboardPageLayout";

export function EditRecipePage() {
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
      {recipe && <EditRecipeForm initialData={recipe} />}
    </DashboardPageLayout>
  );
}
