/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";
import { toast } from "sonner";
import { RecipeEditorForm } from "@/widgets/recipe-editor/ui/RecipeEditorForm";

export const EditRecipeForm = ({ initialData }: { initialData: RecipeDetailResponse }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => recipeApi.updateRecipe(initialData.id, formData),
    // eslint-disable-next-line unused-imports/no-unused-vars
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", initialData.id] });
      navigate(`/recipes/${initialData.id}`);
    },
    onError: (error: any) => {
      console.error("Failed to update recipe", error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Tarif güncellenirken bir hata oluştu.";
      toast.error(errorMessage);
    }
  });

  return (
    <RecipeEditorForm 
      initialData={initialData}
      onSubmit={(formData) => updateMutation.mutate(formData)}
      onCancel={() => navigate(-1)}
      isPending={updateMutation.isPending}
      headerTitle="Tarifi Düzenle"
      submitButtonText="Tarifi Güncelle"
    />
  );
};
