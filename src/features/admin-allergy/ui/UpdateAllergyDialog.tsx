import { PencilLine, Sparkles } from "lucide-react";
import { useUpdateAllergy, useAdminAllergyById } from "@/entities/admin-allergy";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { AllergyForm, type AllergyFormValues } from "@/widgets/admin-allergy/ui/AllergyForm";
import { PremiumEntityDialog } from "@/shared/ui/dialog/PremiumEntityDialog";

interface UpdateAllergyDialogProps {
  allergyId: string | null;
  onClose: () => void;
}

export const UpdateAllergyDialog = ({ allergyId, onClose }: UpdateAllergyDialogProps) => {
  const { data: allergy, isLoading: isLoadingAllergy } = useAdminAllergyById(allergyId as string);
  const { mutate: updateAllergy, isPending } = useUpdateAllergy();

  const onSubmit = (data: AllergyFormValues) => {
    if (!allergyId) return;
    updateAllergy(
      {
        id: allergyId,
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
      isOpen={!!allergyId}
      onClose={onClose}
      title="Kısıtlamayı Düzenle"
      description={
        <>
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Seçili alerjen veya kısıtlama profilini yapılandırın.
        </>
      }
      icon={<PencilLine className="w-full h-full" />}
      themeColor="primary"
    >
      {isLoadingAllergy ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Profil Bilgileri Yükleniyor...</p>
        </div>
      ) : (
        <AllergyForm
          initialData={allergy}
          isUpdateMode
          onSubmit={onSubmit}
          onCancel={onClose}
          isPending={isPending}
          submitLabel="Kısıtlamayı Güncelle"
        />
      )}
    </PremiumEntityDialog>
  );
};
