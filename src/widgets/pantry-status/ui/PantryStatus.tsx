import { PieChart, Activity, ShoppingCart, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import { shoppingListApi } from "@/entities/shopping-list/api/shoppingListApi";

export const PantryStatus = () => {
  const { data: pantryItems, isLoading: isPantryLoading } = useQuery({
    queryKey: ["my-pantry"],
    queryFn: pantryApi.getMyPantry,
  });

  const { data: shoppingListItems, isLoading: isShoppingLoading } = useQuery({
    queryKey: ["shopping-list"],
    queryFn: shoppingListApi.getMyShoppingList,
  });

  const isLoading = isPantryLoading || isShoppingLoading;

  if (isLoading) {
    return (
      <div className="w-full h-[320px] bg-card/40 rounded-[2.5rem] border border-muted/50 animate-pulse"></div>
    );
  }

  // --- Data Processing for Visuals ---

  const totalPantry = pantryItems?.length || 0;

  // 1. Categories Breakdown
  const categoryCounts: Record<string, number> = {};
  pantryItems?.forEach(item => {
    categoryCounts[item.categoryName] = (categoryCounts[item.categoryName] || 0) + 1;
  });
  
  const categoryColors = ["bg-primary", "bg-primary/70", "bg-primary/40", "bg-primary/20", "bg-muted"];
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  
  const topCategories = sortedCategories.slice(0, 3);
  const otherCount = sortedCategories.slice(3).reduce((acc, curr) => acc + curr[1], 0);
  
  const finalCategories = [...topCategories];
  if (otherCount > 0) {
    finalCategories.push(["Diğer", otherCount]);
  }
  
  const categoryData = finalCategories
    .map(([name, count], idx) => ({ 
      name: name as string, 
      count: count as number, 
      percentage: totalPantry === 0 ? 0 : Math.round((count as number / totalPantry) * 100),
      color: categoryColors[idx]
    }));

  // 2. Freshness Index
  let fresh = 0, expiring = 0, expired = 0;
  pantryItems?.forEach(item => {
    if (!item.expirationDate) {
      fresh++;
      return;
    }
    const expDate = new Date(item.expirationDate);
    const today = new Date();
    expDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = expDate.getTime() - today.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (days < 0) expired++;
    else if (days <= 5) expiring++;
    else fresh++;
  });
  
  const freshPct = totalPantry === 0 ? 0 : (fresh / totalPantry) * 100;
  const expiringPct = totalPantry === 0 ? 0 : (expiring / totalPantry) * 100;
  const expiredPct = totalPantry === 0 ? 0 : (expired / totalPantry) * 100;

  // 3. Shopping List Completion
  const totalShopping = shoppingListItems?.length || 0;
  const purchased = shoppingListItems?.filter(i => i.isPurchased).length || 0;
  const shoppingPct = totalShopping === 0 ? 0 : Math.round((purchased / totalShopping) * 100);
  const strokeDasharray = 251.2; // 2 * pi * 40
  const strokeDashoffset = strokeDasharray - (strokeDasharray * shoppingPct) / 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/40 backdrop-blur-2xl p-8 lg:p-12 rounded-[3rem] border border-muted/50 shadow-xl shadow-black/5 flex flex-col relative overflow-hidden min-h-[320px]"
    >
      {/* Subtle Background Glow */}
      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 lg:divide-x divide-muted/30 relative z-10 flex-1">
        
        {/* STAT 1: Category Breakdown */}
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <PieChart className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-foreground text-base uppercase tracking-wider">Dolap Dağılımı</h3>
              <p className="text-sm text-muted-foreground font-medium">Toplam {totalPantry} malzeme</p>
            </div>
          </div>

          {totalPantry > 0 ? (
            <div className="mt-auto flex flex-col justify-end">
              <div className="h-5 w-full flex rounded-full overflow-hidden mb-6 bg-muted/50">
                {categoryData.map((cat, idx) => (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    key={idx} 
                    className={`h-full ${cat.color} border-r-2 border-card last:border-0 relative group/bar`}
                  >
                    {cat.percentage > 15 && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90">
                        %{cat.percentage}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {categoryData.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${cat.color}`}></div>
                    <span className="text-sm text-muted-foreground font-semibold truncate flex-1">{cat.name} <span className="opacity-50 ml-1">(%{cat.percentage})</span></span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-base text-muted-foreground mt-auto">Analiz edilecek veri yok.</p>
          )}
        </div>

        {/* STAT 2: Freshness Gauge */}
        <div className="flex flex-col lg:pl-16 h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-foreground text-base uppercase tracking-wider">Tazelik Endeksi</h3>
              <p className="text-sm text-muted-foreground font-medium">Gıda güvenliği</p>
            </div>
          </div>

          {totalPantry > 0 ? (
            <div className="mt-auto flex flex-col justify-end">
              <div className="flex h-5 w-full rounded-full overflow-hidden mb-6 bg-muted/50">
                {freshPct > 0 && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${freshPct}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="bg-emerald-500/80 h-full border-r-2 border-card last:border-0"
                  />
                )}
                {expiringPct > 0 && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${expiringPct}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="bg-amber-400/80 h-full border-r-2 border-card last:border-0"
                  />
                )}
                {expiredPct > 0 && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${expiredPct}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-rose-500/80 h-full border-r-2 border-card last:border-0"
                  />
                )}
              </div>
              
              <div className="flex justify-between items-end text-center">
                <div className="flex flex-col items-center">
                  <p className="text-3xl font-black text-emerald-500 mb-1 leading-none">{fresh}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Taze</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-3xl font-black text-amber-500 mb-1 leading-none">{expiring}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Riskli</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-3xl font-black text-rose-500 mb-1 leading-none">{expired}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Geçmiş</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-base text-muted-foreground mt-auto">Analiz edilecek veri yok.</p>
          )}
        </div>

        {/* STAT 3: Shopping Progress */}
        <div className="flex flex-col lg:pl-16 h-full">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-foreground text-base uppercase tracking-wider">Alışveriş Durumu</h3>
              <p className="text-sm text-muted-foreground font-medium">Liste tamamlama</p>
            </div>
          </div>

          {totalShopping > 0 ? (
            <div className="flex-1 flex items-center justify-between gap-6 mt-auto">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-base font-bold text-foreground">{purchased} Ürün Alındı</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-[3px] border-muted-foreground/30 shrink-0"></div>
                  <span className="text-base font-semibold text-muted-foreground">{totalShopping - purchased} Ürün Bekliyor</span>
                </div>
              </div>

              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/50" />
                  <motion.circle 
                    cx="50" cy="50" r="40" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    className="text-primary"
                    initial={{ strokeDashoffset: strokeDasharray }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray={strokeDasharray}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-foreground">%{shoppingPct}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center mt-auto border-2 border-dashed border-muted/50 rounded-2xl py-6">
              <p className="text-sm font-semibold text-muted-foreground text-center">
                Alışveriş listeniz şu an boş.
              </p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};
