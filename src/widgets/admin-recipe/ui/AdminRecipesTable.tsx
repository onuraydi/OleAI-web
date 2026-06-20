import React, { useState } from 'react';
import { useAdminRecipes } from '@/entities/admin-recipe';
import type { AdminRecipeDTO } from '@/entities/admin-recipe';
import { ApproveRecipeDialog, RejectRecipeDialog } from '@/features/admin-recipe';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ChefHat, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminTableContainer, type ColumnDef } from '@/shared/ui/data-table/AdminTableContainer';

interface AdminRecipesTableProps {
  fixedStatus?: string;
}

export function AdminRecipesTable({ fixedStatus }: AdminRecipesTableProps) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState('All');

  const activeStatus = fixedStatus || statusFilter;

  const { data: paginatedData, isLoading, isError } = useAdminRecipes({
    page,
    size,
    searchTerm,
    status: activeStatus,
    visibility: visibilityFilter
  });

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
      header: 'Görünürlük',
      render: (recipe) => (
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${recipe.visibility === 'Public' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {recipe.visibility === 'Public' ? 'Herkese Açık' : 'Sadece Ben'}
        </span>
      ),
    },
    {
      header: 'Tarih',
      className: 'text-sm text-muted-foreground',
      render: (recipe) => new Date(recipe.createdDate).toLocaleDateString('tr-TR'),
    },
    {
      header: 'İşlemler',
      className: 'text-right',
      render: (recipe) => {
        const isPending = recipe.status === 'PendingAdminApproval';
        return (
          <div className="flex items-center justify-end gap-2 transition-opacity">
            {isPending && (
              <>
                <ApproveRecipeDialog recipeId={recipe.id} recipeTitle={recipe.title} />
                <RejectRecipeDialog recipeId={recipe.id} recipeTitle={recipe.title} />
              </>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 font-bold" 
              asChild
            >
              <Link to={`/admin/recipes/${recipe.id}`}>
                <Eye className="w-3.5 h-3.5" />
                İncele
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminTableContainer
      data={paginatedData?.items || []}
      columns={columns}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      isError={isError}
      loadingMessage="Tarifler yükleniyor..."
      errorMessage="Hata"
      errorDescription="Tarifler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin."
      searchTerm={searchTerm}
      onSearchChange={(val) => {
        setSearchTerm(val);
        setPage(1);
      }}
      searchPlaceholder="Tarif adı ile ara..."
      filters={
        <Select value={visibilityFilter} onValueChange={(val) => { setVisibilityFilter(val); setPage(1); }}>
          <SelectTrigger className="w-[160px] rounded-xl bg-background border-none">
            <SelectValue placeholder="Görünürlük Seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Tüm Görünürlük</SelectItem>
            <SelectItem value="Public">Herkese Açık</SelectItem>
            <SelectItem value="Private">Sadece Ben</SelectItem>
          </SelectContent>
        </Select>
      }
      totalItems={paginatedData?.totalItems ?? 0}
      totalLabel="tarif bulundu"
      page={page}
      size={size}
      totalPages={paginatedData?.totalPages ?? 1}
      hasPreviousPage={paginatedData?.hasPreviousPage ?? false}
      hasNextPage={paginatedData?.hasNextPage ?? false}
      onPageChange={(p) => setPage(p)}
      onSizeChange={(s) => {
        setSize(s);
        setPage(1);
      }}
      emptyStateIcon={ChefHat}
      emptyStateText="Bu kriterlere uygun tarif bulunamadı"
    />
  );
}
