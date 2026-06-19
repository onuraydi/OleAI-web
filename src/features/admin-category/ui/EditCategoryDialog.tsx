import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { useUpdateCategory } from "@/entities/admin-category/api/adminCategoryQueries";
import type { Category } from "@/entities/admin-category/model/types";
import { toPascalCase } from "@/shared/lib/icon-helpers";
import { CategoryForm } from "@/widgets/admin-category/ui/CategoryForm";
import type { CategoryFormValues } from "@/widgets/admin-category/ui/CategoryForm";

interface EditCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditCategoryDialog = ({ category, isOpen, onClose }: EditCategoryDialogProps) => {
  const { mutate: updateCategory, isPending } = useUpdateCategory();

  const onSubmit = (data: CategoryFormValues) => {
    if (!category) return;
    updateCategory(
      { id: category.id, name: data.name, iconName: toPascalCase(data.iconName) },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kategoriyi Düzenle</DialogTitle>
          <DialogDescription>
            Kategorinin adını veya ikonunu güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          initialData={category ? { name: category.name, iconName: category.iconName } : null}
          onSubmit={onSubmit}
          onCancel={onClose}
          isPending={isPending}
          submitLabel="Güncelle"
        />
      </DialogContent>
    </Dialog>
  );
};
