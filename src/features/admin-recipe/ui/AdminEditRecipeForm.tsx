import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeApi } from "@/entities/recipe/api/recipeApi";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import type { RecipeDetailResponse } from "@/entities/recipe/api/recipeApi";
import { RecipeEditorForm } from "@/widgets/recipe-editor/ui/RecipeEditorForm";

interface AdminEditRecipeFormProps {
  initialData: RecipeDetailResponse;
  isReviewMode?: boolean;
  prefillAiEdits?: { description: string; steps: string[] } | null;
  onCancel?: () => void;
}

export const AdminEditRecipeForm = ({ initialData, isReviewMode = false, prefillAiEdits, onCancel }: AdminEditRecipeFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  let aiCorrectedDescription: string | null = null;
  let aiCorrectedSteps: string[] = [];
  
  if (isReviewMode && initialData.llmReviewResultJson) {
    try {
      const parsed = JSON.parse(initialData.llmReviewResultJson);
      aiCorrectedDescription = parsed.correctedDescription || null;
      aiCorrectedSteps = parsed.correctedSteps || [];
    } catch { /* ignore */ }
  }

  const approveMutation = useMutation({
    mutationFn: () => recipeApi.approveRecipe(initialData.id),
    onSuccess: () => {
      toast.success("Tarif başarıyla onaylandı!");
      queryClient.invalidateQueries({ queryKey: ["admin-recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe-detail", initialData.id] });
      navigate('/admin/recipes');
    },
    onError: (error) => {
      console.error("Failed to approve recipe", error);
      toast.error("Tarif kaydedildi ancak onaylanırken bir hata oluştu.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => recipeApi.updateRecipe(initialData.id, formData),
    onSuccess: () => {
      if (isReviewMode) {
        approveMutation.mutate();
      } else {
        toast.success("Tarif başarıyla güncellendi!");
        queryClient.invalidateQueries({ queryKey: ["admin-recipes"] });
        queryClient.invalidateQueries({ queryKey: ["recipe-detail", initialData.id] });
        navigate(`/admin/recipes/${initialData.id}`);
      }
    },
    onError: (error) => {
      console.error("Failed to update recipe", error);
      toast.error("Tarif kaydedilirken bir hata oluştu.");
    }
  });

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  const isPending = updateMutation.isPending || approveMutation.isPending;

  return (
    <RecipeEditorForm 
      initialData={initialData}
      onSubmit={(formData) => updateMutation.mutate(formData)}
      onCancel={handleCancel}
      isPending={isPending}
      headerTitle="Tarifi Düzenle"
      submitButtonText={isReviewMode ? "Değişiklikleri Kaydet ve Onayla" : "Tarifi Güncelle"}
      prefillAiEdits={prefillAiEdits}
      aiSuggestions={
        isReviewMode && (aiCorrectedDescription || aiCorrectedSteps.length > 0) 
          ? { description: aiCorrectedDescription, steps: aiCorrectedSteps } 
          : undefined
      }
      extraActions={
        isReviewMode && (
          <button 
            type="button"
            onClick={() => approveMutation.mutate()}
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> Direkt Onayla (Değişiklik Yapmadan)
          </button>
        )
      }
    />
  );
};
