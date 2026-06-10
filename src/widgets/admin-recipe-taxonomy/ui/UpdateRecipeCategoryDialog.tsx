import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useUpdateRecipeCategory } from '@/entities/admin-recipe-taxonomy/api/adminRecipeTaxonomyQueries';
import type { RecipeCategory } from '@/entities/admin-recipe-taxonomy/model/types';

interface UpdateRecipeCategoryDialogProps {
  category: RecipeCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateRecipeCategoryDialog = ({ category, open, onOpenChange }: UpdateRecipeCategoryDialogProps) => {
  const [name, setName] = useState(category.name);
  const [iconName, setIconName] = useState(category.iconName);
  const updateMutation = useUpdateRecipeCategory();

  useEffect(() => {
    setName(category.name);
    setIconName(category.iconName);
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await updateMutation.mutateAsync({ id: category.id, name, iconName });
      onOpenChange(false);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Kategoriyi Düzenle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-name" className="text-sm font-bold">Kategori Adı</Label>
              <Input
                id="update-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Tatlılar"
                className="h-12 rounded-xl bg-muted/50 border-none px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="update-iconName" className="text-sm font-bold">İkon Adı (Material Symbols)</Label>
              <Input
                id="update-iconName"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="Örn: cake"
                className="h-12 rounded-xl bg-muted/50 border-none px-4"
              />
              <p className="text-xs text-muted-foreground">Google Material Symbols ikon adını giriniz.</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-bold h-12 px-6"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="rounded-xl font-bold h-12 px-6"
              disabled={updateMutation.isPending || !name.trim()}
            >
              {updateMutation.isPending ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
