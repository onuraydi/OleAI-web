import { useState, useMemo } from "react";
import { Loader2, Plus, Tags, Pencil, Trash2, Archive, ArchiveRestore, Edit2 } from "lucide-react";
import { useAdminIngredients, useDeleteIngredientMutation, type Ingredient, MeasurementCategory } from "@/entities/admin-ingredient";
import { UpdateIngredientDialog, ManageAliasesDialog } from "@/features/admin-ingredient";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { toast } from "sonner";
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
import { getCategoryIcon, getCategoryColorClass } from "@/shared/lib/icon-helpers";

const getMeasurementCategoryName = (category: MeasurementCategory) => {
  switch (category) {
    case MeasurementCategory.Weight: return "Ağırlık (g/kg)";
    case MeasurementCategory.Volume: return "Hacim (ml/L)";
    case MeasurementCategory.Count: return "Adet";
    case MeasurementCategory.Other: return "Diğer";
    default: return "Bilinmiyor";
  }
};

export const IngredientsTable = ({ searchTerm = "" }: { searchTerm?: string }) => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const { data, isLoading } = useAdminIngredients(page, size);
  const deleteMutation = useDeleteIngredientMutation();

  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isAliasOpen, setIsAliasOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!searchTerm) return data.items;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.items.filter(req => 
      req.name?.toLowerCase().includes(lowerSearch) || 
      req.categoryName?.toLowerCase().includes(lowerSearch)
    );
  }, [data?.items, searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Malzeme başarıyla silindi");
      setDeleteId(null);
    } catch {
      toast.error("Silme işlemi başarısız oldu");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Table Container */}
      <div className="bg-card border border-muted/30 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-muted/30">
              <tr>
                <th className="px-6 py-5 font-black tracking-wider w-[40%]">Malzeme Adı</th>
                <th className="px-6 py-5 font-black tracking-wider">Kategori</th>
                <th className="px-6 py-5 font-black tracking-wider">Birim Ailesi</th>
                <th className="px-6 py-5 font-black tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/30">
              {filteredItems.map((ingredient) => {
                const iconColorClass = getCategoryColorClass(ingredient.categoryIconName || ingredient.categoryName);
                
                return (
                <tr key={ingredient.id} className="hover:bg-muted/30 transition-all duration-200 group">
                  <td className="px-6 py-4 font-bold text-foreground">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${iconColorClass}`}>
                        {getCategoryIcon(ingredient.categoryIconName, ingredient.categoryName, "w-6 h-6")}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base flex items-center gap-2">
                          {ingredient.name}
                          {ingredient.isPolarizing && (
                            <span className="bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                              Yaygın Olarak Sevilmeyen
                            </span>
                          )}
                        </span>
                        {ingredient.deletedDate && (
                          <span className="flex items-center gap-1 text-[10px] text-destructive uppercase tracking-widest mt-1 font-black">
                            <Archive className="w-3 h-3" /> Pasif / Silinmiş
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-muted/50 px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground border border-muted-foreground/10">
                      {ingredient.categoryName || "Kategorisiz"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                      {getMeasurementCategoryName(ingredient.unitFamily)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
                        onClick={() => {
                          setSelectedIngredient(ingredient);
                          setIsAliasOpen(true);
                        }}
                      >
                        <Tags className="w-4 h-4 mr-1.5" /> Alias
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 rounded-xl border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                        onClick={() => {
                          setSelectedIngredient(ingredient);
                          setIsUpdateOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-1.5" /> Düzenle
                      </Button>
                      {!ingredient.deletedDate ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive hover:text-white transition-colors"
                          onClick={() => setDeleteId(ingredient.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
                          title="Malzeme zaten silinmiş"
                          disabled
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
              
              {(!data?.items || data.items.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <p className="text-muted-foreground font-bold text-lg">Kayıtlı malzeme bulunamadı.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Pagination Footer */}
      {data && (() => {
        const count = data.count ?? (data as any).totalItems ?? 0;
        const pagesCount = data.pages ?? (data as any).totalPages ?? 1;
        const hasPrev = data.hasPrevious ?? (data as any).hasPreviousPage ?? false;
        const hasNxt = data.hasNext ?? (data as any).hasNextPage ?? false;

        return (
          <div className="flex flex-col sm:flex-row justify-between items-center bg-card px-6 py-4 rounded-[2rem] border border-muted/30 shadow-sm gap-4">
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Sayfa başına:</span>
              <Select 
                value={size.toString()} 
                onValueChange={(val) => {
                  setSize(Number(val));
                  setPage(0); // reset page on size change
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

      {/* Feature Modals */}
      <ManageAliasesDialog 
        ingredient={selectedIngredient} 
        open={isAliasOpen} 
        onOpenChange={setIsAliasOpen} 
      />

      <UpdateIngredientDialog 
        ingredient={selectedIngredient} 
        open={isUpdateOpen} 
        onOpenChange={setIsUpdateOpen} 
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu malzemeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
