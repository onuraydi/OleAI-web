import type { ReactNode } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { Footer } from "@/widgets/footer";
import { Loader2 } from "lucide-react";

interface DashboardPageLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  loadingMessage?: string;
  errorMessage?: string;
  errorDescription?: string;
  className?: string;
}

export function DashboardPageLayout({
  children,
  isLoading = false,
  isError = false,
  loadingMessage = "Yükleniyor...",
  errorMessage = "Bir Hata Oluştu",
  errorDescription = "İşleminizi gerçekleştirirken bir sorunla karşılaştık. Lütfen sayfayı yenileyin.",
  className = "p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full",
}: DashboardPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className={`flex-1 ${className}`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="font-medium">{loadingMessage}</p>
            </div>
          ) : isError ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl flex flex-col items-center justify-center h-64 gap-3 border border-red-100 dark:border-red-900/30">
              <p className="font-bold text-lg">{errorMessage}</p>
              <p className="text-sm text-center max-w-md">{errorDescription}</p>
            </div>
          ) : (
            children
          )}
        </div>
        
        <Footer />
      </main>
    </div>
  );
}
