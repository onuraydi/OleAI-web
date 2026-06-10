import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useCreateRecipeCategory } from '@/entities/admin-recipe-taxonomy/api/adminRecipeTaxonomyQueries';

interface CreateRecipeCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRecipeCategoryDialog = ({ open, onOpenChange }: CreateRecipeCategoryDialogProps) => {
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('category');
  const createMutation = useCreateRecipeCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createMutation.mutateAsync({ name, iconName });
      setName('');
      setIconName('category');
      onOpenChange(false);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Yeni Kategori Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold">Kategori Adı</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Tatlılar"
                className="h-12 rounded-xl bg-muted/50 border-none px-4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iconName" className="text-sm font-bold">İkon Adı (Material Symbols)</Label>
              <Input
                id="iconName"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="Örn: cake"
                className="h-12 rounded-xl bg-muted/50 border-none px-4"
              />
              <p className="text-xs text-muted-foreground">Google Material Symbols ikon adını giriniz. Varsayılan: category</p>
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
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
