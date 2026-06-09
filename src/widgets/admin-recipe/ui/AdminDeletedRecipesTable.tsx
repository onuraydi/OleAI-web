import React, { useState } from 'react';
import { useDeletedRecipes, useRestoreRecipe, useHardDeleteRecipe } from '@/entities/admin-recipe';
import type { AdminRecipeDTO } from '@/entities/admin-recipe';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Search, Trash2, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function AdminDeletedRecipesTable() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paginatedData, isLoading, isError } = useDeletedRecipes({
    page,
    size,
    searchTerm
  });

  const { mutate: restore, isPending: isRestoring } = useRestoreRecipe();
  const { mutate: hardDelete, isPending: isDeleting } = useHardDeleteRecipe();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Silinmiş tarifler yükleniyor...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl p-6 flex flex-col items-center justify-center">
        <AlertCircle className="w-10 h-10 mb-4" />
        <h3 className="text-lg font-bold">Hata</h3>
        <p className="text-sm opacity-80 text-center mt-1">Silinmiş tarifler yüklenirken bir sorun oluştu.</p>
      </div>
    );
  }

  const recipes = paginatedData?.items || [];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 border border-muted/50 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-muted/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-muted/10">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tarif adı ile ara..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-white dark:bg-neutral-950 rounded-xl"
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground font-medium px-2 whitespace-nowrap">
            Toplam <span className="text-foreground font-bold">{paginatedData?.totalItems ?? 0}</span> silinmiş tarif
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-muted/30 bg-muted/5">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Tarif Adı</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Yazar</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {recipes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                        <Trash2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">Çöp kutusu boş</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recipes.map((recipe: AdminRecipeDTO) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={recipe.id}
                    className="border-b border-muted/20 hover:bg-muted/10 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-foreground truncate max-w-[200px] block">
                        {recipe.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                      {recipe.userName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(recipe.createdDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 font-bold"
                          onClick={() => {
                            if(window.confirm('Bu tarifi geri yüklemek istediğinize emin misiniz?')) {
                              restore(recipe.id);
                            }
                          }}
                          disabled={isRestoring || isDeleting}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Geri Yükle
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-bold"
                          onClick={() => {
                            if(window.confirm('DİKKAT: Bu tarif kalıcı olarak silinecektir. Emin misiniz?')) {
                              hardDelete(recipe.id);
                            }
                          }}
                          disabled={isRestoring || isDeleting}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Kalıcı Sil
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {paginatedData && (() => {
        const count = paginatedData.totalItems ?? 0;
        const pagesCount = paginatedData.totalPages ?? 1;
        const hasPrev = paginatedData.hasPreviousPage ?? false;
        const hasNxt = paginatedData.hasNextPage ?? false;
        
        return (
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-neutral-900 px-6 py-4 rounded-[2rem] border border-muted/30 shadow-sm gap-4">
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Sayfa başına:</span>
                <Select 
                  value={size.toString()} 
                  onValueChange={(val) => {
                    setSize(Number(val));
                    setPage(1);
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
                Toplam <strong className="text-foreground">{count}</strong> kayıttan <strong className="text-foreground">{count === 0 ? 0 : (page - 1) * size + 1}-{Math.min(page * size, count)}</strong> arası gösteriliyor.
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!hasPrev}
              >
                Önceki
              </Button>
              <div className="px-3 text-sm font-black text-foreground">
                Sayfa {page} / {pagesCount}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl font-bold"
                onClick={() => setPage(p => Math.min(pagesCount, p + 1))}
                disabled={!hasNxt}
              >
                Sonraki
              </Button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
