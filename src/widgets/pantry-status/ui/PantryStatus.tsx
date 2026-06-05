import { Refrigerator, ArrowUpRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export const PantryStatus = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Items Count */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-muted/30 shadow-sm relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <Refrigerator className="w-6 h-6" />
          </div>
        </div>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mb-4">Dolabındaki Malzemeler</p>
        <h3 className="text-4xl font-black text-muted-foreground/40 mb-2">--</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
          <span className="text-primary/60 flex items-center">Dolabını bağla</span> başlamak için
        </p>
      </motion.div>

      {/* Expiring Soon */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-muted/30 shadow-sm relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mb-4">Tazeliği Geçmek Üzere</p>
        <h3 className="text-4xl font-black text-muted-foreground/40 mb-2">--</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
          <span className="text-amber-500/60 flex items-center">Veri yok</span> henüz takip edilmiyor
        </p>
      </motion.div>

      {/* Quick Action */}
      <motion.button 
        whileHover={{ y: -5 }}
        className="bg-primary p-6 rounded-[2rem] shadow-xl shadow-primary/20 flex flex-col justify-end relative overflow-hidden group text-left"
      >
        <div className="absolute top-0 right-0 p-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
        <div className="absolute top-[-20%] left-[-20%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        
        <h3 className="text-xl font-black text-white relative z-10">AI İle Tarif<br />Oluştur</h3>
        <p className="text-white/70 text-sm font-medium mt-2 relative z-10">Mevcut malzemelerinden harikalar yarat.</p>
      </motion.button>
    </div>
  );
};
