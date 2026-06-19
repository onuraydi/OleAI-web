import React from 'react';
import { useGetLogFiles, adminLogApi } from '@/entities/admin-log';
import { Button } from '@/shared/ui/button';
import { FileText, Download, AlertCircle, RefreshCw } from 'lucide-react';

export function AdminLogFilesTable() {
  const { data: logFiles, isLoading, isError, refetch, isRefetching } = useGetLogFiles();

  const handleDownload = async (fileName: string) => {
    try {
      const blob = await adminLogApi.downloadLogFile(fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Log dosyası indirilemedi:", err);
      // Optional: show toast here
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-muted/50 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px] mt-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Log dosyaları yükleniyor...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl p-6 flex flex-col items-center justify-center mt-8">
        <AlertCircle className="w-10 h-10 mb-4" />
        <h3 className="text-lg font-bold">Hata</h3>
        <p className="text-sm opacity-80 text-center mt-1">Log dosyaları yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-muted/50 rounded-[2rem] shadow-sm overflow-hidden flex flex-col mt-8">
      <div className="p-4 border-b border-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/10">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Fiziksel Log Dosyaları (.txt)</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            Toplam <span className="text-foreground font-bold">{logFiles?.length || 0}</span> dosya
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isRefetching}
            className="rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-muted/30 bg-muted/5">
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dosya Adı</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[150px]">Boyut</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[200px]">Son Değiştirilme</th>
              <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-[120px] text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {!logFiles || logFiles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">Henüz fiziksel log dosyası bulunmuyor</p>
                  </div>
                </td>
              </tr>
            ) : (
              logFiles.map((file) => (
                <tr
                  key={file.name}
                  className="border-b border-muted/20 hover:bg-muted/10 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                    {formatBytes(file.sizeBytes)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                    {new Date(file.lastModified).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleDownload(file.name)}
                      className="rounded-xl shadow-sm hover:shadow"
                    >
                      <Download className="w-4 h-4 mr-2" /> İndir
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
