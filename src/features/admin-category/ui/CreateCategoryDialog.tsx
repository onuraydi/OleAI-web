import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { useCreateCategory } from "@/entities/admin-category/api/adminCategoryQueries";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { CategoryForm } from "@/widgets/admin-category/ui/CategoryForm";
import type { CategoryFormValues } from "@/widgets/admin-category/ui/CategoryForm";

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCategoryDialog = ({ isOpen, onClose }: CreateCategoryDialogProps) => {
  const { mutate: createCategory, isPending } = useCreateCategory();

  const onSubmit = (data: CategoryFormValues) => {
    createCategory(
      { name: data.name, iconName: toPascalCase(data.iconName) },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Kategori Ekle</DialogTitle>
          <DialogDescription>
            Uygulamada kullanılacak yeni bir malzeme kategorisi oluşturun.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          onSubmit={onSubmit}
          onCancel={onClose}
          isPending={isPending}
          submitLabel="Ekle"
        />
      </DialogContent>
    </Dialog>
  );
};
