import React, { useState } from 'react';
import { useAdminUsers } from '@/entities/admin-user';
import type { AdminUserDTO } from '@/entities/admin-user';
import { AssignAdminDialog } from '@/features/admin-user/ui/AssignAdminDialog';
import { UnlockUserDialog } from '@/features/admin-user/ui/UnlockUserDialog';
import { BanUserDialog } from '@/features/admin-user/ui/BanUserDialog';
import { ShieldCheck, UserX } from 'lucide-react';
import { AdminTableContainer, type ColumnDef } from '@/shared/ui/data-table/AdminTableContainer';

export function AdminUsersTable() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: paginatedData, isLoading, isError } = useAdminUsers(page, size);

  const users = paginatedData?.items || [];
  
  // Note: the backend may or may not support server-side search yet, 
  // but if it relies on client-side filtering we handle it here:
  const filteredUsers = users.filter((user: AdminUserDTO) => {
    const term = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  const columns: ColumnDef<AdminUserDTO>[] = [
    {
      header: 'Kullanıcı',
      render: (user) => (
        <div className="flex flex-col">
          <span className="font-bold text-foreground">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      )
    },
    {
      header: 'Roller',
      render: (user) => {
        const isAdmin = user.roles.includes('Admin');
        return (
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
        );
      }
    },
    {
      header: 'Durum',
      render: (user) => {
        const isLocked = user.lockoutEnd && new Date(user.lockoutEnd) > new Date();
        const isBanned = !user.isActive;

        if (isBanned) {
          return (
            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-bold">
              Banlandı
            </div>
          );
        }
        if (isLocked) {
          return (
            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
              Kilitli
            </div>
          );
        }
        return (
          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold">
            Aktif
          </div>
        );
      }
    },
    {
      header: 'İşlemler',
      className: 'text-right',
      render: (user) => {
        const isAdmin = user.roles.includes('Admin');
        const isLocked = user.lockoutEnd && new Date(user.lockoutEnd) > new Date();
        const isBanned = !user.isActive;

        return (
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
        );
      }
    }
  ];

  return (
    <AdminTableContainer
      data={filteredUsers}
      columns={columns}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      isError={isError}
      loadingMessage="Kullanıcılar yükleniyor..."
      errorMessage="Hata"
      errorDescription="Kullanıcılar yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin."
      searchTerm={searchTerm}
      onSearchChange={(term) => {
        setSearchTerm(term);
        // Page reset might be useful if client-side filtering makes us go out of bounds,
        // but typically user search relies on the backend if totalItems > size. We keep page consistent.
        setPage(1);
      }}
      searchPlaceholder="İsim veya e-posta ile ara..."
      totalItems={filteredUsers.length}
      totalLabel="kullanıcı bulundu"
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
      emptyStateIcon={UserX}
      emptyStateText="Kullanıcı bulunamadı"
    />
  );
}
