import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useApproveRecipe } from '@/entities/admin-recipe';
import { toast } from 'sonner';

interface ApproveRecipeDialogProps {
  recipeId: string;
  recipeTitle: string;
}

export function ApproveRecipeDialog({ recipeId, recipeTitle }: ApproveRecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: approveRecipe, isPending } = useApproveRecipe();

  const handleApprove = async () => {
    try {
      await approveRecipe(recipeId);
      toast.success(`${recipeTitle} başarıyla onaylandı.`);
      setOpen(false);
    } catch (error) {
      toast.error('Tarif onaylanırken bir hata oluştu.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Onayla">
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Tarifi Onayla</DialogTitle>
          <DialogDescription>
            <strong className="text-foreground">{recipeTitle}</strong> isimli tarifi onaylamak ve topluluğa açmak istediğinize emin misiniz?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
            İptal
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isPending}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Evet, Onayla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
