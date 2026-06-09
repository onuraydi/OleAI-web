import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { AlertTriangle } from "lucide-react";
import { useDeleteCategory } from "@/entities/admin-category/api/adminCategoryQueries";
import type { Category } from "@/entities/admin-category/model/types";

interface DeleteCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteCategoryDialog = ({ category, isOpen, onClose }: DeleteCategoryDialogProps) => {
  const { mutate: deleteCategory, isPending } = useDeleteCategory();

  const handleDelete = () => {
    if (!category) return;
    deleteCategory(category.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle>Kategoriyi Sil</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <DialogDescription className="text-base text-foreground">
            <span className="font-bold">"{category?.name}"</span> adlı kategoriyi silmek istediğinize emin misiniz?
          </DialogDescription>
          <p className="text-sm text-muted-foreground mt-2">
            Bu işlem geri alınamaz. Eğer bu kategoriye bağlı malzemeler varsa sistem silme işlemine izin vermeyebilir.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            İptal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Siliniyor..." : "Evet, Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
