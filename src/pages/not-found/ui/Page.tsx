import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChefHat, Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-card p-8 md:p-12 rounded-[2.5rem] border border-border/50 shadow-xl flex flex-col items-center text-center relative z-10"
      >
        {/* İkon Grubu */}
        <div className="relative mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-32 h-32 bg-primary/10 rounded-[2.5rem] rotate-12 flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-2xl"
          >
            <Search className="w-16 h-16 text-primary -rotate-12" />
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.4 }}
            className="absolute -top-4 -right-4 w-16 h-16 bg-background rounded-2xl -rotate-12 flex items-center justify-center shadow-xl border border-muted/50"
          >
            <ChefHat className="w-8 h-8 text-foreground rotate-12" />
          </motion.div>
        </div>

        {/* 404 Başlık */}
        <h1 className="text-7xl md:text-8xl font-black text-foreground mb-4 tracking-tight">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          Bu Tarifi Bulamadık
        </h2>
        
        <p className="text-lg text-muted-foreground mb-10 max-w-md font-medium">
          Aradığınız sayfa mutfakta kaybolmuş gibi görünüyor. Belki ana menüye dönmek istersiniz?
        </p>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-card border-2 border-muted/60 text-foreground font-bold hover:bg-muted/50 hover:border-primary/50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri Dön
          </button>
          
          <Link 
            to="/"
            replace
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            Ana Sayfaya Git
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
