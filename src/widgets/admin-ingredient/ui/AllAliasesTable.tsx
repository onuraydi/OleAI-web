/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { Loader2, Trash2, Tags } from "lucide-react";
import { 
  useAllAliases, 
  useDeleteAliasMutation, 
  useAdminIngredients,
  useRestoreAliasMutation 
} from "@/entities/admin-ingredient";
import { Button } from "@/shared/ui/button";
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

export const AllAliasesTable = ({ searchTerm = "" }: { searchTerm?: string }) => {
  const { data: aliases, isLoading: isLoadingAliases } = useAllAliases();
  const { data: ingredientsData, isLoading: isLoadingIngredients } = useAdminIngredients(0, 500);
  
  const deleteMutation = useDeleteAliasMutation(""); 
  const restoreMutation = useRestoreAliasMutation("");

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Eş anlamlı kelime başarıyla silindi");
      setDeleteId(null);
    } catch {
      toast.error("Silme işlemi başarısız oldu");
    }
  };

  const isLoading = isLoadingAliases || isLoadingIngredients;

  // Create a map for ingredient names
  const ingredientMap = useMemo(() => {
    const map = new Map<string, string>();
    if (ingredientsData) {
      ingredientsData.items.forEach(ing => map.set(ing.id, ing.name));
    }
    return map;
  }, [ingredientsData]);

  const filteredAliases = useMemo(() => {
    if (!aliases) return [];
    if (!searchTerm) return aliases;
    
    const lowerSearch = searchTerm.toLowerCase();
    return aliases.filter(a => {
      const masterName = ingredientMap.get(a.ingredientId) || "";
      return a.aliasName.toLowerCase().includes(lowerSearch) || 
             masterName.toLowerCase().includes(lowerSearch);
    });
  }, [aliases, searchTerm, ingredientMap]);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-muted/30 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-muted/30">
              <tr>
                <th className="px-6 py-5 font-black tracking-wider w-[40%]">Eş Anlamlı Kelime (Alias)</th>
                <th className="px-6 py-5 font-black tracking-wider w-[40%]">Ana Malzeme (Master)</th>
                <th className="px-6 py-5 font-black tracking-wider text-right w-[20%]">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/30">
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {filteredAliases.map((alias: any) => (
                <tr key={alias.id} className="hover:bg-muted/30 transition-all duration-200 group">
                  <td className="px-6 py-4 font-bold text-foreground">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Tags className="w-6 h-6" />
                      </div>
                      <span className={`text-base ${alias.deletedDate ? 'line-through text-muted-foreground' : ''}`}>
                        {alias.aliasName}
                        {alias.deletedDate && <span className="ml-2 text-xs font-normal text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">(Silindi)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-muted-foreground">
                    <span className="bg-muted/50 px-3 py-1.5 rounded-xl text-xs font-bold text-muted-foreground border border-muted-foreground/10">
                      {ingredientMap.get(alias.ingredientId) || "Bilinmiyor"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {alias.deletedDate ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl"
                        onClick={async () => {
                          try {
                            await restoreMutation.mutateAsync(alias.id);
                            toast.success("Eş anlamlı kelime başarıyla geri getirildi");
                          } catch {
                            toast.error("Geri getirme işlemi başarısız oldu");
                          }
                        }}
                        disabled={restoreMutation.isPending}
                      >
                        {restoreMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Geri Getir
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-destructive hover:bg-destructive hover:text-white"
                        onClick={() => setDeleteId(alias.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredAliases.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    {searchTerm ? "Aradığınız kriterde eş anlamlı kelime bulunamadı." : "Sistemde kayıtlı eş anlamlı kelime bulunamadı."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alias Silinecek</AlertDialogTitle>
            <AlertDialogDescription>
              Bu eş anlamlı kelimeyi silmek istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
