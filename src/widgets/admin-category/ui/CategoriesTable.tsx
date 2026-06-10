import { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Search, Pencil, Trash2, HelpCircle, RotateCcw } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import type { Category } from "@/entities/admin-category/model/types";
import { useAdminCategories, useRestoreCategory } from "@/entities/admin-category/api/adminCategoryQueries";

interface CategoriesTableProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const toPascalCase = (str: string) => {
  return str
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
};

export const CategoriesTable = ({ onEdit, onDelete }: CategoriesTableProps) => {
  const { data: categories = [], isLoading } = useAdminCategories();
  const restoreCategoryMutation = useRestoreCategory();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  if (isLoading) {
    return (
      <div className="bg-card border border-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Kategoriler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-muted/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Kategori adı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="text-sm text-muted-foreground font-medium px-2">
          Toplam <span className="text-foreground font-bold">{filteredCategories.length}</span> kategori bulundu
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-muted/30 bg-muted/5">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16">İkon</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Kategori Adı</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Lucide İkon Kodu</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Kategori bulunamadı</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => {
                const parsedIconName = category.iconName ? toPascalCase(category.iconName) : "";
                const IconComponent = parsedIconName ? (LucideIcons as any)[parsedIconName] : null;
                const isPassive = !!category.deletedDate;

                return (
                  <tr
                    key={category.id}
                    className={`border-b border-muted/20 hover:bg-muted/10 transition-colors group ${isPassive ? 'opacity-60 bg-muted/5' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        {IconComponent ? (
                          <IconComponent className="w-5 h-5 text-primary" />
                        ) : (
                          <HelpCircle className="w-5 h-5 text-muted-foreground opacity-50" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{category.name}</span>
                        {isPassive && (
                          <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                            Pasif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted/30 text-xs font-mono text-muted-foreground">
                        {category.iconName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        {isPassive ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => restoreCategoryMutation.mutate(category.id)}
                            disabled={restoreCategoryMutation.isPending}
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Geri Yükle"
                          >
                            <RotateCcw className={`w-4 h-4 ${restoreCategoryMutation.isPending ? 'animate-spin' : ''}`} />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(category)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Düzenle"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(category)}
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
