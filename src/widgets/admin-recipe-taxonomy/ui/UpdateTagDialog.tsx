import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useUpdateTag } from '@/entities/admin-recipe-taxonomy/api/adminRecipeTaxonomyQueries';
import type { Tag } from '@/entities/admin-recipe-taxonomy/model/types';

interface UpdateTagDialogProps {
  tag: Tag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateTagDialog = ({ tag, open, onOpenChange }: UpdateTagDialogProps) => {
  const [name, setName] = useState(tag.name);
  const updateMutation = useUpdateTag();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(tag.name);
  }, [tag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await updateMutation.mutateAsync({ id: tag.id, name });
      onOpenChange(false);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Etiketi Düzenle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-tag-name" className="text-sm font-bold">Etiket Adı</Label>
              <Input
                id="update-tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Glutensiz"
                className="h-12 rounded-xl bg-muted/50 border-none px-4"
                required
              />
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
