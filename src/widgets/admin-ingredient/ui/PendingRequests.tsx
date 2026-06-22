import { useState, useMemo } from "react";
import { Loader2, AlertCircle, Bot, HandMetal, CheckCircle, Sparkles } from "lucide-react";
import { usePendingRequests, type PendingRequest } from "@/entities/admin-ingredient";
import { ResolveRequestDialog } from "@/features/admin-ingredient";
import { Button } from "@/shared/ui/button";

export const PendingRequests = ({ searchTerm = "" }: { searchTerm?: string }) => {
  const { data, isLoading } = usePendingRequests();
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchTerm) return data;
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(req => {
      const nameMatch = req.requestedName?.toLowerCase().includes(lowerSearch);
      const llmMatch = req.llmAnalysisResult?.toLowerCase().includes(lowerSearch);
      return nameMatch || llmMatch;
    });
  }, [data, searchTerm]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="bg-card border border-muted/30 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <HandMetal className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-foreground mb-3">Bekleyen Talep Yok</h3>
        <p className="text-muted-foreground font-medium max-w-md leading-relaxed">
          {searchTerm ? "Arama kriterlerinize uygun talep bulunamadı." : "Şu anda yapay zeka analizi tamamlanmış ve onayınızı bekleyen yeni bir malzeme talebi bulunmuyor."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!searchTerm && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex gap-4 text-amber-700 dark:text-amber-400 items-start">
          <AlertCircle className="w-6 h-6 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-base font-black mb-1">Onay Bekleyen {data?.length} İşlem Var</p>
            <p className="opacity-90 font-medium leading-relaxed">
              Aşağıdaki talepler kullanıcılar tarafından oluşturulmuş ve AI tarafından ön analizi yapılmıştır. 
              Lütfen her birini inceleyerek onaylayın, reddedin veya mevcut bir malzemeyle eşleştirin.
            </p>
          </div>
        </div>
      )}

      <div className="bg-card border border-muted/30 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-muted/30">
              <tr>
                <th className="px-6 py-5 font-black tracking-wider w-1/2">Talep Edilen Malzeme</th>
                <th className="px-6 py-5 font-black tracking-wider w-1/4">Tarih</th>
                <th className="px-6 py-5 font-black tracking-wider text-right w-1/4">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/30">
              {filteredData.slice(page * size, (page + 1) * size).map((request) => {
                let displayName = request.requestedName;
                let isJson = false;
                
                if (displayName && displayName.startsWith('{') && displayName.endsWith('}')) {
                  try {
                    const parsed = JSON.parse(displayName);
                    displayName = parsed.RequestedName || parsed.Name || "Bilinmeyen Malzeme (JSON Hatası)";
                    isJson = true;
                  // eslint-disable-next-line unused-imports/no-unused-vars
                  } catch (e) {
                    // ignore
                  }
                }

                let parsedLlm: any = null;
                if (request.llmAnalysisResult && request.llmAnalysisResult.trim().startsWith('{')) {
                  try {
                    parsedLlm = JSON.parse(request.llmAnalysisResult);
                  } catch {
                    // Not valid JSON, will fallback to raw string
                  }
                }

                return (
                <tr key={request.id} className="hover:bg-muted/30 transition-all duration-200 group">
                  <td className="px-6 py-6 font-bold text-foreground align-top">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base">{displayName}</span>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="bg-[#FF9800]/10 text-[#FF9800] px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3" /> Yeni Talep
                      </span>
                        {isJson && (
                          <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit">
                            Sistem Hatası (JSON)
                          </span>
                        )}
                      </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-muted-foreground font-medium align-top">
                    {new Date(request.createdDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-6 text-right align-top">
                    <Button 
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsResolveOpen(true);
                      }}
                      className="rounded-xl font-bold h-10 px-5 bg-foreground text-background hover:bg-foreground/90 shadow-sm w-full md:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Karar Ver
                    </Button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center bg-card px-6 py-4 rounded-[2rem] border border-muted/30 shadow-sm gap-4">
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Sayfa başına:</span>
            <select
              className="w-[80px] h-8 rounded-xl bg-muted/50 border-none text-sm px-2 focus:ring-2 focus:ring-primary outline-none"
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <span>
            Toplam <strong className="text-foreground">{filteredData.length}</strong> kayıttan <strong className="text-foreground">{filteredData.length === 0 ? 0 : page * size + 1}-{Math.min((page + 1) * size, filteredData.length)}</strong> arası gösteriliyor.
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-bold"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Önceki
          </Button>
          <div className="px-3 text-sm font-black text-foreground">
            Sayfa {page + 1} / {Math.ceil(filteredData.length / size) || 1}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl font-bold"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(filteredData.length / size) - 1}
          >
            Sonraki
          </Button>
        </div>
      </div>

      <ResolveRequestDialog 
        request={selectedRequest}
        open={isResolveOpen}
        onOpenChange={setIsResolveOpen}
      />
    </div>
  );
};
