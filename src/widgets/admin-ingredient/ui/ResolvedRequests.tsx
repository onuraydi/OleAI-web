import { useState, useMemo } from "react";
import { Loader2, CheckCircle2, XCircle, GitMerge, FileClock } from "lucide-react";
import { useResolvedRequests } from "@/entities/admin-ingredient";
import { Button } from "@/shared/ui/button";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ApprovedAsNew":
      return (
        <span className="flex items-center gap-1.5 w-fit bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" /> Yeni Eklendi
        </span>
      );
    case "Rejected":
      return (
        <span className="flex items-center gap-1.5 w-fit bg-destructive/10 text-destructive px-3 py-1.5 rounded-xl text-xs font-bold border border-destructive/20">
          <XCircle className="w-4 h-4" /> Reddedildi
        </span>
      );
    case "MergedAsAlias":
      return (
        <span className="flex items-center gap-1.5 w-fit bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-500/20">
          <GitMerge className="w-4 h-4" /> Alias Yapıldı
        </span>
      );
    default:
      return <span className="bg-secondary px-3 py-1.5 rounded-xl text-xs font-bold border border-border">{status}</span>;
  }
};

const getStatusIconStyle = (status: string) => {
  switch (status) {
    case "ApprovedAsNew": return { icon: <CheckCircle2 className="w-6 h-6" />, bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    case "Rejected": return { icon: <XCircle className="w-6 h-6" />, bg: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" };
    case "MergedAsAlias": return { icon: <GitMerge className="w-6 h-6" />, bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    default: return { icon: <FileClock className="w-6 h-6" />, bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" };
  }
};

export const ResolvedRequests = ({ searchTerm = "" }: { searchTerm?: string }) => {
  const [page, setPage] = useState(0);
  const size = 15;
  
  const { data, isLoading } = useResolvedRequests(page, size);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!searchTerm) return data.items;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.items.filter(req => 
      req.requestedName?.toLowerCase().includes(lowerSearch) || 
      req.adminNote?.toLowerCase().includes(lowerSearch)
    );
  }, [data?.items, searchTerm]);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-neutral-900 border border-muted/30 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-muted/30">
              <tr>
                <th className="px-6 py-5 font-black tracking-wider">İşlem Detayı</th>
                <th className="px-6 py-5 font-black tracking-wider w-[15%]">Tarih</th>
                <th className="px-6 py-5 font-black tracking-wider w-[20%]">Sonuç</th>
                <th className="px-6 py-5 font-black tracking-wider w-[25%]">Yönetici Notu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/30">
              {filteredItems.map((req) => {
                const style = getStatusIconStyle(req.status);
                
                return (
                <tr key={req.id} className="hover:bg-muted/30 transition-all duration-200 group">
                  <td className="px-6 py-4 font-bold text-foreground">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${style.bg}`}>
                        {style.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base">{req.requestedName}</span>
                        <span className="text-xs text-muted-foreground mt-0.5 font-medium">Talep No: {req.id.split('-')[0]}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium align-middle">
                    {new Date(req.createdDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <p className="text-muted-foreground text-sm font-medium max-w-xs truncate" title={req.adminNote || "-"}>
                      {req.adminNote || "-"}
                    </p>
                  </td>
                </tr>
              )})}
              
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    {searchTerm ? "Aradığınız kriterde işlem geçmişi bulunamadı." : "Geçmiş işlem bulunamadı."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.pages > 1 && (
        <div className="flex justify-between items-center bg-card p-4 rounded-2xl border shadow-sm">
          <span className="text-sm text-muted-foreground">
            Toplam <strong>{data.count}</strong> işlemden <strong>{page * size + 1}-{Math.min((page + 1) * size, data.count)}</strong> arası gösteriliyor.
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={!data.hasPrevious}
            >
              Önceki
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)}
              disabled={!data.hasNext}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
