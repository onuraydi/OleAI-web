import { useSessionStore } from '@/entities/session';
import { Button } from '@/shared/ui/button';

export const AdminDashboardPage = () => {
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 space-y-6 bg-white rounded-xl shadow-lg w-full max-w-2xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin Paneli</h1>
          <p className="text-muted-foreground">
            Hoş geldin, <span className="font-semibold text-primary">{user?.email}</span>
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          {/* Gelecekte eklenecek widget'lar için yer tutucular */}
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center min-h-[150px]">
            <p className="text-sm text-muted-foreground">İstatistikler Çok Yakında</p>
          </div>
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center min-h-[150px]">
            <p className="text-sm text-muted-foreground">Kullanıcı Yönetimi Çok Yakında</p>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button variant="destructive" onClick={logout}>
            Çıkış Yap
          </Button>
        </div>
      </div>
    </div>
  );
};
