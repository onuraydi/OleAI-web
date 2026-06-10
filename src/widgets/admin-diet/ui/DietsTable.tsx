import { useState } from "react";
import { 
  Pencil, 
  Trash2, 
  Search,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useAdminDiets, useDeleteDiet, useRestoreDiet } from "@/entities/admin-diet";
import type { DietDTO } from "@/entities/admin-diet";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { UpdateDietDialog } from "@/features/admin-diet";
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

export const DietsTable = () => {
  const { data: diets, isLoading, error } = useAdminDiets();
  const { mutate: deleteDiet, isPending: isDeleting } = useDeleteDiet();
  const { mutate: restoreDiet, isPending: isRestoring } = useRestoreDiet();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDietForUpdate, setSelectedDietForUpdate] = useState<string | null>(null);
  
  const [dietToDelete, setDietToDelete] = useState<DietDTO | null>(null);
  const [dietToRestore, setDietToRestore] = useState<DietDTO | null>(null);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Diyet tercihleri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-destructive/5 border border-destructive/20 rounded-2xl flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-destructive">Yükleme Hatası</h3>
          <p className="text-sm text-destructive/80 mt-1">
            Diyet tercihleri listesi alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  // Filter Data
  const dietList = Array.isArray(diets) ? diets : [];
  const filteredDiets = dietList.filter((diet) =>
    diet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = () => {
    if (dietToDelete) {
      deleteDiet(dietToDelete.id, {
        onSuccess: () => {
          toast.success("Diyet tercihi başarıyla silindi (pasife alındı).");
          setDietToDelete(null);
        },
        onError: () => {
          toast.error("Silme işlemi başarısız oldu.");
          setDietToDelete(null);
        }
      });
    }
  };

  const handleRestore = () => {
    if (dietToRestore) {
      restoreDiet(dietToRestore.id, {
        onSuccess: () => {
          toast.success("Diyet tercihi başarıyla geri yüklendi.");
          setDietToRestore(null);
        },
        onError: () => {
          toast.error("Geri yükleme işlemi başarısız oldu.");
          setDietToRestore(null);
        }
      });
    }
  };

  return (
    <div className="bg-card border border-muted/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Diyet adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="text-sm text-muted-foreground font-medium px-2">
          Toplam <span className="text-foreground font-bold">{filteredDiets.length}</span> kayıt bulundu
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-muted/30 bg-muted/5">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16">İkon</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Diyet Adı</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Açıklama</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dışlanan Öğeler</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Diyet tercihi bulunamadı.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDiets.map((diet, index) => {
                const isDeleted = !!diet.deletedDate;
                const parsedIconName = diet.iconName ? diet.iconName : "Leaf";
                const IconComponent = (LucideIcons as any)[parsedIconName] || LucideIcons.Leaf;

                return (
                  <tr
                    key={diet.id}
                    className={`border-b border-muted/20 hover:bg-muted/10 transition-colors group ${isDeleted ? 'opacity-60 bg-muted/5' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{diet.name}</span>
                        {isDeleted && (
                          <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                            Pasif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-[200px]">
                      {diet.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {diet.excludedCategoryCount > 0 && (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                            {diet.excludedCategoryCount} Kategori
                          </div>
                        )}
                        {diet.excludedIngredientCount > 0 && (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                            {diet.excludedIngredientCount} Malzeme
                          </div>
                        )}
                        {diet.excludedCategoryCount === 0 && diet.excludedIngredientCount === 0 && (
                          <span className="text-muted-foreground/50 italic text-xs font-medium">Yok</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        {isDeleted ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDietToRestore(diet)}
                            disabled={isRestoring}
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Geri Yükle"
                          >
                            <RotateCcw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedDietForUpdate(diet.id)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Düzenle"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDietToDelete(diet)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!dietToDelete} onOpenChange={(open) => !open && setDietToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-destructive/20 max-w-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Diyet Silinecek</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              <strong>{dietToDelete?.name}</strong> isimli diyeti silmek (pasife almak) istediğinize emin misiniz? <br/><br/>
              Kullanıcılar bu diyeti seçemez hale gelecektir. Bu işlemi daha sonra geri alabilirsiniz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center flex-row gap-3 pt-4 border-t">
            <AlertDialogCancel className="mt-0 rounded-xl">İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-xl"
            >
              {isDeleting ? "Siliniyor..." : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!dietToRestore} onOpenChange={(open) => !open && setDietToRestore(null)}>
        <AlertDialogContent className="rounded-2xl border-emerald-500/20 max-w-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 mx-auto">
              <RotateCcw className="w-6 h-6 text-emerald-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Diyeti Geri Yükle</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              <strong>{dietToRestore?.name}</strong> isimli silinmiş diyeti tekrar aktif hale getirmek istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center flex-row gap-3 pt-4 border-t">
            <AlertDialogCancel className="mt-0 rounded-xl">İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRestore} 
              disabled={isRestoring}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
            >
              {isRestoring ? "Geri Yükleniyor..." : "Geri Yükle"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Dialog */}
      <UpdateDietDialog 
        dietId={selectedDietForUpdate} 
        onClose={() => setSelectedDietForUpdate(null)} 
      />
    </div>
  );
};
