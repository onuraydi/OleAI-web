/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { toast } from "sonner";
import { RecipeEditorForm } from "@/widgets/recipe-editor/ui/RecipeEditorForm";

export const CreateRecipeForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: recipeApi.createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Tarif başarıyla oluşturuldu ve onay sürecine gönderildi.");
      navigate("/recipes");
    },
    onError: (error: any) => {
      console.error("Failed to create recipe", error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Tarif oluşturulurken bir hata oluştu.";
      toast.error(errorMessage);
    }
  });

  return (
    <RecipeEditorForm 
      onSubmit={(formData) => createMutation.mutate(formData)}
      onCancel={() => navigate(-1)}
      isPending={createMutation.isPending}
      headerTitle="Yeni Tarif Oluştur"
      submitButtonText="Tarifi Paylaş"
    />
  );
};
