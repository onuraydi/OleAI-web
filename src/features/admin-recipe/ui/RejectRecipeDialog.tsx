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
import { XCircle, Loader2 } from 'lucide-react';
import { useRejectRecipe } from '@/entities/admin-recipe';
import { toast } from 'sonner';

interface RejectRecipeDialogProps {
  recipeId: string;
  recipeTitle: string;
}

export function RejectRecipeDialog({ recipeId, recipeTitle }: RejectRecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const { mutateAsync: rejectRecipe, isPending } = useRejectRecipe();

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Lütfen bir ret sebebi girin.');
      return;
    }

    try {
      await rejectRecipe({ id: recipeId, reason });
      toast.success(`${recipeTitle} reddedildi.`);
      setOpen(false);
      setReason('');
    } catch (error) {
      toast.error('Tarif reddedilirken bir hata oluştu.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Reddet">
          <XCircle className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Tarifi Reddet</DialogTitle>
          <DialogDescription>
            <strong className="text-foreground">{recipeTitle}</strong> isimli tarifi reddetmek üzeresiniz. Lütfen kullanıcı için bir ret sebebi belirtin.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ret sebebi (Örn: Görsel uygunsuz, içerik yetersiz...)"
            className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
            İptal
          </Button>
          <Button 
            onClick={handleReject} 
            disabled={isPending || !reason.trim()}
            variant="destructive"
            className="rounded-xl"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reddet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
