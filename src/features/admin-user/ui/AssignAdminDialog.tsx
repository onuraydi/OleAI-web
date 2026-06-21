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
import { useAssignAdminRole } from '@/entities/admin-user';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface AssignAdminDialogProps {
  userId: string;
  userName: string;
  triggerContext?: React.ReactNode;
}

export function AssignAdminDialog({ userId, userName, triggerContext }: AssignAdminDialogProps) {
  const { mutateAsync: assignAdmin, isPending } = useAssignAdminRole();
  const [open, setOpen] = React.useState(false);

  const handleAssignRole = async () => {
    try {
      await assignAdmin({ userId });
      toast.success(`${userName} kullanıcısına Admin yetkisi başarıyla verildi.`);
      setOpen(false);
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      toast.error('Admin yetkisi verilirken bir hata oluştu.');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {triggerContext || (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
            <Shield className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Admin Yetkisi Ver</AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="text-foreground">{userName}</strong> adlı kullanıcıya <strong>Admin</strong> yetkisi vermek istediğinize emin misiniz? Bu işlem, kullanıcının sistemin tüm yönetim paneline erişmesini sağlar.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleAssignRole();
            }}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isPending ? 'İşleniyor...' : 'Yetki Ver'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
