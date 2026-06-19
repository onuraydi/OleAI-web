import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { isAxiosError } from 'axios';
import NotFoundPage from '@/pages/not-found/ui/Page';

export const GlobalErrorElement = () => {
  const error = useRouteError();
  
  let errorMessage = "Beklenmeyen bir sistem hatası oluştu.";
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    if (errorStatus >= 500) {
      // Geliştirme ortamı dahi olsa, backend'den dönen raw mesajı asla göstermiyoruz.
      errorMessage = "Sunucu tarafında beklenmeyen bir hata oluştu.";
    } else {
      errorMessage = error.data?.message || error.statusText;
    }
  } else if (isAxiosError(error)) {
    errorStatus = error.response?.status || 500;
    if (errorStatus >= 500) {
      errorMessage = "Sunucu tarafında beklenmeyen bir hata oluştu.";
    } else {
      errorMessage = error.response?.data?.message || error.message;
    }
  } else if (error instanceof Error) {
    errorMessage = "Sistemde geçici bir arıza meydana geldi.";
  }

  // Eğer 404 hatasıysa (Route bulunamadıysa veya API'den veri bulunamadıysa) direkt NotFound sayfasını göster
  if (errorStatus === 404) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg w-full bg-card p-8 md:p-12 rounded-[2.5rem] border border-border/50 shadow-xl flex flex-col items-center text-center z-10"
      >
        <div className="w-20 h-20 bg-destructive/5 rounded-[2rem] rotate-12 flex items-center justify-center mb-8 border border-destructive/10 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-destructive -rotate-12" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
          Oops!
        </h1>
        
        <h2 className="text-xl font-bold text-destructive mb-2">
          Hata {errorStatus}
        </h2>

        <p className="text-lg text-muted-foreground mb-8 font-medium">
          {errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <button 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-card border-2 border-muted/60 text-foreground font-bold hover:bg-muted/50 transition-all shadow-sm"
          >
            <RefreshCcw className="w-5 h-5" />
            Yenile
          </button>
          
          <Link 
            to="/"
            replace
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            Ana Sayfa
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
