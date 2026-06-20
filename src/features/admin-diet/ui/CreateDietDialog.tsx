import { Leaf, Sparkles } from "lucide-react";
import { useCreateDiet } from "@/entities/admin-diet";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { DietForm, type DietFormValues } from "@/widgets/admin-diet/ui/DietForm";
import { PremiumEntityDialog } from "@/shared/ui/dialog/PremiumEntityDialog";

interface CreateDietDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDietDialog = ({ isOpen, onClose }: CreateDietDialogProps) => {
  const { mutate: createDiet, isPending } = useCreateDiet();

  const onSubmit = (data: DietFormValues) => {
    createDiet(
      { ...data, iconName: toPascalCase(data.iconName), description: data.description ?? undefined },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <PremiumEntityDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Yeni Diyet Tercihi"
      description={
        <>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Kullanıcıların beslenme tarzlarına özel yeni bir diyet profili oluşturun.
        </>
      }
      icon={<Leaf className="w-full h-full" />}
      themeColor="emerald"
    >
      <DietForm 
        onSubmit={onSubmit}
        onCancel={onClose}
        isPending={isPending}
        submitLabel="Diyeti Oluştur"
      />
    </PremiumEntityDialog>
  );
};
