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
import { useBanUser } from '@/entities/admin-user';
import { toast } from 'sonner';
import { Ban } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface BanUserDialogProps {
  userId: string;
  userName: string;
  triggerContext?: React.ReactNode;
}

export function BanUserDialog({ userId, userName, triggerContext }: BanUserDialogProps) {
  const { mutateAsync: banUser, isPending } = useBanUser();
  const [open, setOpen] = React.useState(false);

  const handleBan = async () => {
    try {
      await banUser({ userId });
      toast.success(`${userName} kullanıcısı başarıyla banlandı.`);
      setOpen(false);
    } catch (error) {
      toast.error('Kullanıcı banlanırken bir hata oluştu.');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {triggerContext || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Ban className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kullanıcıyı Banla</AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="text-foreground">{userName}</strong> adlı kullanıcıyı banlamak istediğinize emin misiniz? Bu işlem, kullanıcının sisteme erişimini kalıcı olarak engeller ve açık oturumlarını kapatır.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleBan();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'İşleniyor...' : 'Banla'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
