import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { type Ingredient, ExpirationMode, useUpdateIngredientMutation } from "@/entities/admin-ingredient";
import { toast } from "sonner";
import { IngredientForm, type IngredientFormValues } from "@/widgets/admin-ingredient/ui/IngredientForm";

interface UpdateIngredientDialogProps {
  ingredient: Ingredient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateIngredientDialog = ({ ingredient, open, onOpenChange }: UpdateIngredientDialogProps) => {
  const updateMutation = useUpdateIngredientMutation(ingredient?.id || "");

  const onSubmit = async (data: IngredientFormValues) => {
    if (!ingredient) return;
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        categoryId: data.categoryId,
        unitFamily: data.unitFamily,
        isPolarizing: data.isPolarizing,
        isStaple: data.isStaple,
        estimatedShelfLifeInDays: data.estimatedShelfLifeInDays || null,
        defaultExpirationMode: ExpirationMode.ShelfLife
      });
      toast.success("Malzeme başarıyla güncellendi");
      onOpenChange(false);
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      toast.error("Malzeme güncellenirken bir hata oluştu");
    }
  };

  if (!ingredient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Malzemeyi Güncelle</DialogTitle>
          <DialogDescription>
            <span className="font-bold text-foreground">"{ingredient.name}"</span> malzemesinin bilgilerini güncelliyorsunuz.
          </DialogDescription>
        </DialogHeader>

        <IngredientForm 
          initialData={ingredient}
          onSubmit={onSubmit}
          isPending={updateMutation.isPending}
          submitLabel="Değişiklikleri Kaydet"
        />
      </DialogContent>
    </Dialog>
  );
};
