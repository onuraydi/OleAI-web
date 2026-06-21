import { ShieldAlert, Sparkles } from "lucide-react";
import { useCreateAllergy } from "@/entities/admin-allergy";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { AllergyForm, type AllergyFormValues } from "@/widgets/admin-allergy/ui/AllergyForm";
import { PremiumEntityDialog } from "@/shared/ui/dialog/PremiumEntityDialog";

interface CreateAllergyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAllergyDialog = ({ isOpen, onClose }: CreateAllergyDialogProps) => {
  const { mutate: createAllergy, isPending } = useCreateAllergy();

  const onSubmit = (data: AllergyFormValues) => {
    createAllergy(
      { ...data, iconName: toPascalCase(data.iconName), description: data.description ?? undefined },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <PremiumEntityDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Kısıtlama Ekle"
      description={
        <>
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Kullanıcılar için yeni bir alerjen veya kısıtlama profili oluşturun.
        </>
      }
      icon={<ShieldAlert className="w-full h-full" />}
      themeColor="primary"
    >
      <AllergyForm 
        onSubmit={onSubmit}
        onCancel={onClose}
        isPending={isPending}
        submitLabel="Kısıtlamayı Oluştur"
      />
    </PremiumEntityDialog>
  );
};
