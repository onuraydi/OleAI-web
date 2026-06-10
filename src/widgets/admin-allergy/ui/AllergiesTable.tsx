import { useState, useMemo } from "react";
import { Search, Pencil, Trash2, ShieldAlert, RotateCcw } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { useAdminAllergies, useRestoreAllergy } from "@/entities/admin-allergy";
import * as LucideIcons from "lucide-react";

interface AllergiesTableProps {
  onEdit: (allergy: any) => void;
  onDelete: (allergy: any) => void;
}

export const AllergiesTable = ({ onEdit, onDelete }: AllergiesTableProps) => {
  const { data, isLoading } = useAdminAllergies();
  const restoreAllergyMutation = useRestoreAllergy();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAllergies = useMemo(() => {
    if (!data) return [];
    
    // Check if the API response is wrapped in { items: [] } or just []
    const items = Array.isArray(data) ? data : (data as any).items || [];

    if (!searchQuery) return items;
    
    return items.filter((allergy: any) =>
      allergy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allergy.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <div className="bg-card border border-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Alerjiler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-muted/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Alerji adı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="text-sm text-muted-foreground font-medium px-2">
          Toplam <span className="text-foreground font-bold">{filteredAllergies.length}</span> kayıt bulundu
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-muted/30 bg-muted/5">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16">İkon</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Alerji/Kısıtlama Adı</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Açıklama</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dışlanan Öğeler</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredAllergies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Alerji veya kısıtlama bulunamadı</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAllergies.map((allergy: any) => {
                const isPassive = !!allergy.deletedDate;
                const IconComponent = allergy.iconName ? (LucideIcons as any)[allergy.iconName] : ShieldAlert;

                return (
                  <tr
                    key={allergy.id}
                    className={`border-b border-muted/20 hover:bg-muted/10 transition-colors group ${isPassive ? 'opacity-60 bg-muted/5' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        {IconComponent ? <IconComponent className="w-5 h-5 text-primary" /> : <ShieldAlert className="w-5 h-5 text-primary" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{allergy.name}</span>
                        {isPassive && (
                          <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                            Pasif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-[200px]">
                      {allergy.description || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {allergy.excludedCategoryCount > 0 && (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                            {allergy.excludedCategoryCount} Kategori
                          </div>
                        )}
                        {allergy.excludedIngredientCount > 0 && (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                            {allergy.excludedIngredientCount} Malzeme
                          </div>
                        )}
                        {allergy.excludedCategoryCount === 0 && allergy.excludedIngredientCount === 0 && (
                          <span className="text-muted-foreground/50 italic text-xs font-medium">Yok</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        {isPassive ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => restoreAllergyMutation.mutate(allergy.id)}
                            disabled={restoreAllergyMutation.isPending}
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Geri Yükle"
                          >
                            <RotateCcw className={`w-4 h-4 ${restoreAllergyMutation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(allergy)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Düzenle"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(allergy)}
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
    </div>
  );
};
