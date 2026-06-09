import { Refrigerator, ArrowUpRight, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { Link } from "react-router-dom";

export const PantryStatus = () => {
  const { data: pantryItems, isLoading } = useQuery({
    queryKey: ["my-pantry"],
    queryFn: pantryApi.getMyPantry,
  });

  const totalItems = pantryItems?.length || 0;
  
  // Calculate expiring items (expires within 3 days or already expired)
  const expiringItemsCount = pantryItems?.filter(item => {
    if (!item.expirationDate) return false;
    const expDate = new Date(item.expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3; // Expiring in 3 days or already expired
  }).length || 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-muted/50 rounded-[2rem] animate-pulse"></div>
        ))}
      </div>
    );
  }

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
        <h3 className="text-4xl font-black text-muted-foreground/40 mb-2">{totalItems > 0 ? totalItems : "--"}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
          {totalItems > 0 ? (
            <><span className="text-primary/60 flex items-center">Harika,</span> dolabın dolu</>
          ) : (
            <><span className="text-primary/60 flex items-center">Dolabını bağla</span> başlamak için</>
          )}
        </p>
      </motion.div>

      {/* Expiring Soon */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-muted/30 shadow-sm relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4">
          <div className={`w-12 h-12 ${expiringItemsCount > 0 ? 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white' : 'bg-muted/50 text-muted-foreground'} rounded-2xl flex items-center justify-center transition-all duration-500`}>
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
        <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mb-4">Tazeliği Geçmek Üzere</p>
        <h3 className={`text-4xl font-black mb-2 ${expiringItemsCount > 0 ? 'text-amber-500/80' : 'text-muted-foreground/40'}`}>
          {expiringItemsCount > 0 ? expiringItemsCount : "--"}
        </h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 font-medium">
          {expiringItemsCount > 0 ? (
            <><span className="text-amber-500/60 flex items-center">Dikkat,</span> bozulmak üzere</>
          ) : totalItems > 0 ? (
            <><span className="text-green-500/60 flex items-center">Harika,</span> her şey taze</>
          ) : (
            <><span className="text-amber-500/60 flex items-center">Veri yok</span> henüz takip edilmiyor</>
          )}
        </p>
      </motion.div>

      {/* Quick Action */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-primary rounded-[2rem] shadow-xl shadow-primary/20 relative overflow-hidden group"
      >
        <Link to="/recipes/create" className="block w-full h-full p-6 text-left flex flex-col justify-end">
          <div className="absolute top-0 right-0 p-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute top-[-20%] left-[-20%] w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <h3 className="text-xl font-black text-white relative z-10">AI İle Tarif<br />Oluştur</h3>
          <p className="text-white/70 text-sm font-medium mt-2 relative z-10">Mevcut malzemelerinden harikalar yarat.</p>
        </Link>
      </motion.div>
    </div>
  );
};
