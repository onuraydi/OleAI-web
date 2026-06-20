import React, { useState } from 'react';
import { useDeletedRecipes, useRestoreRecipe, useHardDeleteRecipe } from '@/entities/admin-recipe';
import type { AdminRecipeDTO } from '@/entities/admin-recipe';
import { Button } from '@/shared/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { AdminTableContainer, type ColumnDef } from '@/shared/ui/data-table/AdminTableContainer';

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

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(1);
  };
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const isPending = isRestoring || isDeleting;

  const columns: ColumnDef<AdminRecipeDTO>[] = [
    {
      header: 'Tarif Adı',
      render: (recipe) => (
        <span className="font-bold text-foreground truncate max-w-[200px] block">
          {recipe.title}
        </span>
      ),
    },
    {
      header: 'Yazar',
      className: 'text-sm text-muted-foreground font-medium',
      render: (recipe) => recipe.userName,
    },
    {
      header: 'Tarih',
      className: 'text-sm text-muted-foreground',
      render: (recipe) => new Date(recipe.createdDate).toLocaleDateString('tr-TR'),
    },
    {
      header: 'İşlemler',
      className: 'text-right',
      render: (recipe) => (
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
            disabled={isPending}
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
            disabled={isPending}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Kalıcı Sil
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminTableContainer
      data={paginatedData?.items || []}
      columns={columns}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      isError={isError}
      loadingMessage="Silinmiş tarifler yükleniyor..."
      errorMessage="Hata"
      errorDescription="Silinmiş tarifler yüklenirken bir sorun oluştu."
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Tarif adı ile ara..."
      totalItems={paginatedData?.totalItems ?? 0}
      totalLabel="silinmiş tarif"
      page={page}
      size={size}
      totalPages={paginatedData?.totalPages ?? 1}
      hasPreviousPage={paginatedData?.hasPreviousPage ?? false}
      hasNextPage={paginatedData?.hasNextPage ?? false}
      onPageChange={handlePageChange}
      onSizeChange={handleSizeChange}
      emptyStateIcon={Trash2}
      emptyStateText="Çöp kutusu boş"
    />
  );
}
