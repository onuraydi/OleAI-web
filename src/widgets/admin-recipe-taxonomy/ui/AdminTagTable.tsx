import { useState, useMemo } from 'react';
import { Pencil, Trash2, Tag as TagIcon, Search } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { useAdminTags, useDeleteTag } from '@/entities/admin-recipe-taxonomy/api/adminRecipeTaxonomyQueries';
import type { Tag } from '@/entities/admin-recipe-taxonomy/model/types';
import { UpdateTagDialog } from './UpdateTagDialog';

export const AdminTagTable = () => {
  const { data: tags, isLoading } = useAdminTags();
  const deleteMutation = useDeleteTag();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filteredTags = useMemo(() => {
    if (!tags) return [];
    if (!searchTerm) return tags;

    const lowerSearch = searchTerm.toLowerCase();
    return tags.filter((t: Tag) => t.name.toLowerCase().includes(lowerSearch));
  }, [tags, searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Error handled in hook
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Etiketler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-muted/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Etiket adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="text-sm text-muted-foreground font-medium px-2">
            Toplam <span className="text-foreground font-bold">{filteredTags.length}</span> etiket bulundu
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-muted/30 bg-muted/5">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16">İkon</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Etiket Adı</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {(!filteredTags || filteredTags.length === 0) ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                        <Search className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">Etiket bulunamadı</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag: Tag) => (
                  <tr key={tag.id} className="border-b border-muted/20 hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <TagIcon className="w-5 h-5 text-green-600" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-foreground">{tag.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedTag(tag);
                            setIsUpdateOpen(true);
                          }}
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Düzenle"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(tag.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTag && (
        <UpdateTagDialog
          tag={selectedTag}
          open={isUpdateOpen}
          onOpenChange={setIsUpdateOpen}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu etiketi silmek istediğinizden emin misiniz? Etiket silindiğinde tariflerle olan bağlantısı kaldırılacaktır. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
