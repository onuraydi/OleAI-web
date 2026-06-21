import { PencilLine, Sparkles } from "lucide-react";
import { useUpdateDiet, useAdminDietById } from "@/entities/admin-diet";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { DietForm, type DietFormValues } from "@/widgets/admin-diet/ui/DietForm";
import { PremiumEntityDialog } from "@/shared/ui/dialog/PremiumEntityDialog";

interface UpdateDietDialogProps {
  dietId: string | null;
  onClose: () => void;
}

export const UpdateDietDialog = ({ dietId, onClose }: UpdateDietDialogProps) => {
  const { data: diet, isLoading: isLoadingDiet } = useAdminDietById(dietId as string);
  const { mutate: updateDiet, isPending } = useUpdateDiet();

  const onSubmit = (data: DietFormValues) => {
    if (!dietId) return;
    updateDiet(
      {
        id: dietId,
        name: data.name,
        description: data.description || undefined,
        iconName: toPascalCase(data.iconName),
        isActive: data.isActive ?? true,
        excludedIngredientIds: data.excludedIngredientIds,
        excludedCategoryIds: data.excludedCategoryIds,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <PremiumEntityDialog
      isOpen={!!dietId}
      onClose={onClose}
      title="Diyet Tercihini Düzenle"
      description={
        <>
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Seçili diyet tercihini ve dışladığı unsurları yapılandırın.
        </>
      }
      icon={<PencilLine className="w-full h-full" />}
      themeColor="emerald"
    >
      {isLoadingDiet ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Profil Bilgileri Yükleniyor...</p>
        </div>
      ) : (
        <DietForm
          initialData={diet}
          isUpdateMode
          onSubmit={onSubmit}
          onCancel={onClose}
          isPending={isPending}
          submitLabel="Diyeti Güncelle"
        />
      )}
    </PremiumEntityDialog>
  );
};
