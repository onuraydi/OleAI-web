import { useSessionStore } from "@/entities/session";
import { Button } from "@/shared/ui";

export const AdminDashboardPage = () => {
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Hoş geldiniz, {user?.email}</p>
          </div>
          <Button variant="outline" onClick={logout}>Çıkış Yap</Button>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Sistem Durumu</h2>
            <p className="text-muted-foreground">Tüm sistemler aktif ve sorunsuz çalışıyor.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Kullanıcı İstatistikleri</h2>
            <p className="text-muted-foreground">Kullanıcı verileri yükleniyor...</p>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Bekleyen Onaylar</h2>
            <p className="text-muted-foreground">LLM onayından geçen tarifler bekleniyor...</p>
          </div>
        </main>
      </div>
    </div>
  );
};
