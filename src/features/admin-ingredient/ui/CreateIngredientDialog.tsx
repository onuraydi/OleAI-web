import { useState } from "react";
import { Plus } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ExpirationMode, useCreateIngredientMutation } from "@/entities/admin-ingredient";
import { toast } from "sonner";
import { IngredientForm, type IngredientFormValues } from "@/widgets/admin-ingredient/ui/IngredientForm";

export const CreateIngredientDialog = () => {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateIngredientMutation();

  const onSubmit = async (data: IngredientFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        categoryId: data.categoryId,
        unitFamily: data.unitFamily,
        isPolarizing: data.isPolarizing,
        isStaple: data.isStaple,
        estimatedShelfLifeInDays: data.estimatedShelfLifeInDays || null,
        defaultExpirationMode: ExpirationMode.ShelfLife
      });
      toast.success("Malzeme başarıyla eklendi");
      setOpen(false);
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      toast.error("Malzeme eklenirken bir hata oluştu");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Yeni Malzeme
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Malzeme Ekle</DialogTitle>
          <DialogDescription>
            Sisteme yeni bir master malzeme ekleyin. Eş anlamlıları (alias) malzeme oluştuktan sonra ekleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <IngredientForm 
          onSubmit={onSubmit}
          isPending={createMutation.isPending}
          submitLabel="Kaydet"
        />
      </DialogContent>
    </Dialog>
  );
};
