import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { useUnlockUser } from '@/entities/admin-user';
import { toast } from 'sonner';
import { Unlock } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface UnlockUserDialogProps {
  userId: string;
  userName: string;
  triggerContext?: React.ReactNode;
}

export function UnlockUserDialog({ userId, userName, triggerContext }: UnlockUserDialogProps) {
  const { mutateAsync: unlockUser, isPending } = useUnlockUser();
  const [open, setOpen] = React.useState(false);

  const handleUnlock = async () => {
    try {
      await unlockUser({ userId });
      toast.success(`${userName} kullanıcısının kilidi başarıyla açıldı.`);
      setOpen(false);
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      toast.error('Kullanıcı kilidi açılırken bir hata oluştu.');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {triggerContext || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Unlock className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kullanıcı Kilidini Aç</AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="text-foreground">{userName}</strong> adlı kullanıcının hesabındaki kilidi kaldırmak istediğinize emin misiniz? Bu işlem, kullanıcının tekrar sisteme giriş yapabilmesini sağlar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleUnlock();
            }}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? 'İşleniyor...' : 'Kilidi Aç'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
