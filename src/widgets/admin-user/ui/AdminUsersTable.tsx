import React, { useState } from 'react';
import { useAdminUsers } from '@/entities/admin-user';
import type { AdminUserDTO } from '@/entities/admin-user';
import { AssignAdminDialog } from '@/features/admin-user/ui/AssignAdminDialog';
import { UnlockUserDialog } from '@/features/admin-user/ui/UnlockUserDialog';
import { BanUserDialog } from '@/features/admin-user/ui/BanUserDialog';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Search, ShieldCheck, UserX, AlertCircle } from 'lucide-react';

export function AdminUsersTable() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const { data: paginatedData, isLoading, isError } = useAdminUsers(page, size);
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="bg-card border border-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Kullanıcılar yükleniyor...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl p-6 flex flex-col items-center justify-center">
        <AlertCircle className="w-10 h-10 mb-4" />
        <h3 className="text-lg font-bold">Hata</h3>
        <p className="text-sm opacity-80 text-center mt-1">Kullanıcılar yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }

  const users = paginatedData?.items || [];
  
  const filteredUsers = users.filter((user: AdminUserDTO) => {
    const term = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-card border border-muted/50 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="İsim veya e-posta ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="text-sm text-muted-foreground font-medium px-2">
          Toplam <span className="text-foreground font-bold">{filteredUsers.length}</span> kullanıcı bulundu
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-muted/30 bg-muted/5">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Kullanıcı</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Roller</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Durum</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                      <UserX className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Kullanıcı bulunamadı</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user: AdminUserDTO) => {
                const isAdmin = user.roles.includes('Admin');
                const isLocked = user.lockoutEnd && new Date(user.lockoutEnd) > new Date();
                const isBanned = !user.isActive;

                return (
                  <tr
                    key={user.id}
                    className={`border-b border-muted/20 hover:bg-muted/10 transition-colors group ${(isLocked || isBanned) ? 'opacity-70 bg-muted/5' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {isAdmin ? (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Admin
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
                            Kullanıcı
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isBanned ? (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-bold">
                          Banlandı
                        </div>
                      ) : isLocked ? (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                          Kilitli
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">
                          Aktif
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        {!isAdmin && (
                          <AssignAdminDialog userId={user.id} userName={`${user.firstName} ${user.lastName}`} />
                        )}
                        {(isLocked || isBanned) && (
                          <UnlockUserDialog userId={user.id} userName={`${user.firstName} ${user.lastName}`} />
                        )}
                        {!isBanned && !isAdmin && (
                          <BanUserDialog userId={user.id} userName={`${user.firstName} ${user.lastName}`} />
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
      
      {/* Advanced Pagination Footer */}
      {paginatedData && (() => {
        const count = paginatedData.totalItems ?? 0;
        const pagesCount = paginatedData.totalPages ?? 1;
        const hasPrev = paginatedData.hasPreviousPage ?? false;
        const hasNxt = paginatedData.hasNextPage ?? false;
        // In the backend query handler we passed pageNumber (1-indexed). Let's convert to 0-indexed for the UI logic to match ingredients table logic
        // Wait, earlier I set initial page state to 1. The Ingredients table sets initial page to 0. 
        // AdminUsersTable uses 1-indexed page state. I'll stick to 1-indexed here but match the text.
        
        return (
          <div className="flex flex-col sm:flex-row justify-between items-center bg-card px-6 py-4 rounded-[2rem] border border-muted/30 shadow-sm gap-4">
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Sayfa başına:</span>
                <Select 
                  value={size.toString()} 
                  onValueChange={(val) => {
                    setSize(Number(val));
                    setPage(1); // reset to page 1
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
