import React, { useState } from 'react';
import { useGetDatabaseLogs } from '@/entities/admin-log';
import type { SystemLogDto } from '@/entities/admin-log';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Search, AlertCircle, Info, AlertTriangle, XCircle, FileText } from 'lucide-react';

export function AdminLogsTable() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const { data: paginatedData, isLoading, isError } = useGetDatabaseLogs({
    page,
    size,
    keyword: searchTerm || undefined,
    level: levelFilter !== 'All' ? levelFilter : undefined
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Loglar yükleniyor...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl p-6 flex flex-col items-center justify-center">
        <AlertCircle className="w-10 h-10 mb-4" />
        <h3 className="text-lg font-bold">Hata</h3>
        <p className="text-sm opacity-80 text-center mt-1">Loglar yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }

  const logs = paginatedData?.items || [];
  
  const getLevelBadge = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'error':
      case 'fatal':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-bold whitespace-nowrap">
            <XCircle className="w-3 h-3 mr-1" /> Error
          </div>
        );
      case 'warning':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold whitespace-nowrap">
            <AlertTriangle className="w-3 h-3 mr-1" /> Warning
          </div>
        );
      case 'information':
      case 'info':
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold whitespace-nowrap">
            <Info className="w-3 h-3 mr-1" /> Info
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold whitespace-nowrap">
            {level || 'Unknown'}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-muted/50 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
        <div className="flex flex-1 gap-4 items-center max-w-2xl">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Mesaj veya içerik ara..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-background"
            />
          </div>
          <Select 
            value={levelFilter} 
            onValueChange={(val) => {
              setLevelFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Seviye" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Tüm Seviyeler</SelectItem>
              <SelectItem value="Information">Information</SelectItem>
              <SelectItem value="Warning">Warning</SelectItem>
              <SelectItem value="Error">Error</SelectItem>
              <SelectItem value="Fatal">Fatal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground font-medium px-2 whitespace-nowrap">
          Toplam <span className="text-foreground font-bold">{paginatedData?.totalItems || 0}</span> log
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-muted/30 bg-muted/5">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[180px]">Tarih</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[120px]">Seviye</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Mesaj</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Log bulunamadı</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log: SystemLogDto) => (
                <tr
                  key={log.id}
                  className="border-b border-muted/20 hover:bg-muted/10 transition-colors group"
                >
                  <td className="px-6 py-4 align-top">
                    <span className="text-sm font-medium text-muted-foreground">
                      {log.timeStamp ? new Date(log.timeStamp).toLocaleString('tr-TR') : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    {getLevelBadge(log.level)}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-1 max-w-3xl">
                      <span className="font-medium text-foreground text-sm break-words">
                        {log.message}
                      </span>
                      {log.exception && (
                        <div className="mt-2 p-3 bg-destructive/5 border border-destructive/10 rounded-xl text-xs font-mono text-destructive/80 max-h-40 overflow-y-auto break-all">
                          {log.exception}
                        </div>
                      )}
                      {log.properties && (
                        <details className="mt-1">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors inline-block font-medium">Özellikleri Göster (Properties)</summary>
                          <div className="mt-2 p-3 bg-muted/30 border border-muted/50 rounded-xl text-xs font-mono text-muted-foreground break-all max-h-40 overflow-y-auto">
                            {log.properties}
                          </div>
                        </details>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
      
      {paginatedData && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-card px-6 py-4 rounded-[2rem] border border-muted/30 shadow-sm gap-4">
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
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <span>
              Toplam <strong className="text-foreground">{paginatedData.totalItems}</strong> kayıttan <strong className="text-foreground">{paginatedData.totalItems === 0 ? 0 : (page - 1) * size + 1}-{Math.min(page * size, paginatedData.totalItems)}</strong> arası gösteriliyor.
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl font-bold"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!paginatedData.hasPreviousPage}
            >
              Önceki
            </Button>
            <div className="px-3 text-sm font-black text-foreground">
              Sayfa {page} / {paginatedData.totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl font-bold"
              onClick={() => setPage(p => Math.min(paginatedData.totalPages, p + 1))}
              disabled={!paginatedData.hasNextPage}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
