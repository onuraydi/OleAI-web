import type { ReactNode } from 'react';
import React from 'react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ColumnDef<T> {
  header: string;
  className?: string;
  render: (item: T) => ReactNode;
}

interface AdminTableContainerProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string | number;
  
  isLoading?: boolean;
  isError?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  errorDescription?: string;
  
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  
  totalItems: number;
  totalLabel?: string;
  
  page: number;
  size: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  
  emptyStateIcon?: React.ElementType;
  emptyStateText?: string;
}

export function AdminTableContainer<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  isError = false,
  loadingMessage = "Yükleniyor...",
  errorMessage = "Hata",
  errorDescription = "Veriler yüklenirken bir sorun oluştu.",
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Ara...",
  totalItems,
  totalLabel = "kayıt",
  page,
  size,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onSizeChange,
  emptyStateIcon: EmptyIcon,
  emptyStateText = "Kayıt bulunamadı",
  filters,
}: AdminTableContainerProps<T>) {

  if (isLoading) {
    return (
      <div className="bg-card border border-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">{loadingMessage}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl p-6 flex flex-col items-center justify-center">
        <AlertCircle className="w-10 h-10 mb-4" />
        <h3 className="text-lg font-bold">{errorMessage}</h3>
        <p className="text-sm opacity-80 text-center mt-1">{errorDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-muted/50 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-background rounded-xl"
            />
          </div>
          {filters && <div className="flex items-center gap-2">{filters}</div>}
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground font-medium px-2 whitespace-nowrap">
            Toplam <span className="text-foreground font-bold">{totalItems}</span> {totalLabel}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-muted/30 bg-muted/5">
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      {EmptyIcon && (
                        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                          <EmptyIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-muted-foreground font-medium">{emptyStateText}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={keyExtractor(item)}
                    className="border-b border-muted/20 hover:bg-muted/10 transition-colors group"
                  >
                    {columns.map((col, idx) => (
                      <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                        {col.render(item)}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center bg-card px-6 py-4 rounded-[2rem] border border-muted/30 shadow-sm gap-4">
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Sayfa başına:</span>
            <Select 
              value={size.toString()} 
              onValueChange={(val) => {
                onSizeChange(Number(val));
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
            Toplam <strong className="text-foreground">{totalItems}</strong> kayıttan <strong className="text-foreground">{totalItems === 0 ? 0 : (page - 1) * size + 1}-{Math.min(page * size, totalItems)}</strong> arası gösteriliyor.
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-bold"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={!hasPreviousPage}
          >
            Önceki
          </Button>
          <div className="px-3 text-sm font-black text-foreground">
            Sayfa {page} / {totalPages || 1}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-bold"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={!hasNextPage}
          >
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  );
}
