import { useAdminContactMessages, useMarkMessageAsRead, useDeleteMessage } from "@/entities/admin-contact-message";
import type { ContactMessage } from "@/entities/admin-contact-message";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Trash2, MailOpen, Headset, Briefcase, Megaphone, MoreHorizontal } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

const getDepartmentInfo = (dept: string) => {
  switch (dept) {
    case 'support': return { label: 'Müşteri Destek', icon: Headset };
    case 'business': return { label: 'İş Geliştirme', icon: Briefcase };
    case 'press': return { label: 'Basın ve Medya', icon: Megaphone };
    case 'other': return { label: 'Diğer', icon: MoreHorizontal };
    default: return { label: dept, icon: MoreHorizontal };
  }
};

export const ContactMessagesTable = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const { data, isLoading } = useAdminContactMessages(page, size);
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { mutate: markAsRead, isPending: isMarking } = useMarkMessageAsRead();
  // eslint-disable-next-line unused-imports/no-unused-vars
  const { mutate: deleteMessage, isPending: isDeleting } = useDeleteMessage();

  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleView = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewOpen(true);
    if (!message.isRead) {
      markAsRead(message.id);
    }
  };

  const handleDelete = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMessage) {
      deleteMessage(selectedMessage.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
        }
      });
    }
  };

  if (isLoading) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-[2rem] overflow-hidden shadow-sm">
        <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[150px] py-4">Tarih</TableHead>
            <TableHead className="py-4">İsim</TableHead>
            <TableHead className="py-4">Departman</TableHead>
            <TableHead className="py-4 text-center">Durum</TableHead>
            <TableHead className="text-right py-4 pr-6">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items?.map((message) => (
            <TableRow key={message.id} className="group hover:bg-muted/50 transition-colors">
              <TableCell className="py-4">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(message.createdDate), "d MMM yyyy HH:mm", { locale: tr })}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <div className="font-semibold text-foreground">{message.name}</div>
                <a 
                  href={`mailto:${message.email}`}
                  className="text-sm text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {message.email}
                </a>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const { label, icon: Icon } = getDepartmentInfo(message.department);
                    return (
                      <>
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="font-medium truncate max-w-[250px]" title={label}>
                          {label}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </TableCell>
              <TableCell className="py-4 text-center">
                <Badge variant={message.isRead ? "secondary" : "default"} className="font-semibold">
                  {message.isRead ? "Okundu" : "Yeni"}
                </Badge>
              </TableCell>
              <TableCell className="text-right py-4 pr-6">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() => handleView(message)}
                  >
                    <MailOpen className="w-3.5 h-3.5" />
                    <span>Görüntüle</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(message)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {(!data?.items || data.items.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                Hiç mesaj bulunamadı.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      {data && (() => {
        const count = data.count ?? data.items?.length ?? 0;
        const pagesCount = data.pages ?? 1;
        const hasPrev = data.hasPrevious ?? false;
        const hasNxt = data.hasNext ?? false;
        
        return (
          <div className="flex flex-col sm:flex-row justify-between items-center bg-card px-6 py-4 rounded-[2rem] border shadow-sm gap-4">
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Sayfa başına:</span>
                <Select 
                  value={size.toString()} 
                  onValueChange={(val) => {
                    setSize(Number(val));
                    setPage(0); // reset to page 0
                  }}
                >
                  <SelectTrigger className="w-[80px] h-8 rounded-xl bg-muted/50 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <span>
                Toplam <strong className="text-foreground">{count}</strong> kayıttan <strong className="text-foreground">{count === 0 ? 0 : page * size + 1}-{Math.min((page + 1) * size, count)}</strong> arası gösteriliyor.
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={!hasPrev}
              >
                Önceki
              </Button>
              <div className="px-3 text-sm font-black text-foreground">
                Sayfa {page + 1} / {pagesCount}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNxt}
              >
                Sonraki
              </Button>
            </div>
          </div>
        );
      })()}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mesaj Detayı</DialogTitle>
            <DialogDescription>
              {selectedMessage && format(new Date(selectedMessage.createdDate), "d MMMM yyyy HH:mm", { locale: tr })}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Gönderen</span>
                  <div className="font-semibold">{selectedMessage.name}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">E-posta</span>
                  <div>
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Departman</span>
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    const { label, icon: Icon } = getDepartmentInfo(selectedMessage.department);
                    return (
                      <>
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="font-medium text-lg">{label}</div>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Mesaj</span>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mesajı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu mesajı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
