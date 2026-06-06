import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Leaf, Apple, Beef, Fish, Milk, Wheat, Flame, Coffee, Grape, Sparkles, Loader2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import type { PantryItemResponse } from "@/entities/pantry/api/pantryApi";
import { motion, AnimatePresence } from "framer-motion";
import { AddIngredientModal } from "@/features/add-pantry-item/ui/AddIngredientModal";

import { getCategoryIcon } from "@/shared/lib/icon-helpers";

// Deterministic mock for expiration days based on item ID (to keep it consistent across renders)
const getExpirationMock = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const days = (hash % 14) + 1; // 1 to 14 days

  let colorClass = "bg-[#4CAF50]"; // Green
  let textClass = "text-[#4CAF50]";
  let progress = Math.min((days / 14) * 100, 100);

  if (days <= 3) {
    colorClass = "bg-[#F44336]"; // Red
    textClass = "text-[#F44336]";
    progress = 100; // Inverse visualization: red means urgent
  } else if (days <= 7) {
    colorClass = "bg-[#FF9800]"; // Yellow/Orange
    textClass = "text-[#FF9800]";
    progress = 50;
  }

  return { days, colorClass, textClass, progress };
};

export const PantryFeed = ({ externalSearchTerm = "" }: { externalSearchTerm?: string }) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  const { data: pantryItems, isLoading, isError } = useQuery({
    queryKey: ["my-pantry"],
    queryFn: () => pantryApi.getMyPantry(),
  });

  const groupedItems = useMemo(() => {
    if (!pantryItems) return {};

    const filtered = pantryItems.filter(item => 
      item.name.toLowerCase().includes(externalSearchTerm.toLowerCase()) || 
      item.categoryName.toLowerCase().includes(externalSearchTerm.toLowerCase())
    );

    return filtered.reduce((acc, item) => {
      const cat = item.categoryName || "Diğer";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, PantryItemResponse[]>);
  }, [pantryItems, externalSearchTerm]);

  const toggleCollapse = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleExpand = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 bg-white/50 dark:bg-neutral-900/50 rounded-[3rem] border border-muted/30">
        <p className="text-muted-foreground font-bold text-lg">Mutfak dolabınız yüklenirken bir hata oluştu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">Mutfak Dolabım</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Malzemelerinizi yönetin ve tazeliklerini kolayca takip edin.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          {/* Add Ingredient Button */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Malzeme Ekle</span>
          </button>
        </div>
      </div>

      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-neutral-900/50 rounded-[3rem] border border-muted/30">
          <p className="text-muted-foreground font-bold text-lg">Hiç malzeme bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedItems).map(([categoryName, items]) => {
            const isCollapsed = collapsedCategories[categoryName];
            const isExpanded = expandedCategories[categoryName];
            const displayedItems = isExpanded ? items : items.slice(0, 4);

            return (
              <div key={categoryName}>
                {/* Category Header (Clickable for Collapse) */}
                <div 
                  className="flex items-center justify-between mb-6 border-b border-muted/30 pb-4 cursor-pointer group"
                  onClick={() => toggleCollapse(categoryName)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      {getCategoryIcon(categoryName)}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {categoryName}
                    </h2>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </div>
                  <div className="text-muted-foreground group-hover:text-primary transition-colors p-1 rounded-full group-hover:bg-primary/10">
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </div>
                </div>

                {/* Items Grid */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {displayedItems.map((item, idx) => {
                          const expiration = getExpirationMock(item.id);
                          return (
                            <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-white dark:bg-neutral-900 rounded-[2rem] p-6 shadow-sm border border-muted/30 flex flex-col items-center text-center group hover:shadow-md transition-shadow relative overflow-hidden"
                            >
                              <div className="w-16 h-16 bg-[#F4F1E1] dark:bg-[#F4F1E1]/10 rounded-full flex items-center justify-center text-[#556B2F] mb-4 group-hover:scale-110 transition-transform">
                                 {getCategoryIcon(categoryName)}
                              </div>
                              
                              <h3 className="font-black text-foreground mb-1 line-clamp-1">{item.name}</h3>
                              <p className="text-sm font-medium text-muted-foreground mb-6">
                                {item.quantity} {item.unit}
                                {item.isPendingApproval && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                    Bekliyor
                                  </span>
                                )}
                              </p>

                              <div className="w-full mt-auto">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-2">
                                  <div 
                                    className={`h-full rounded-full ${expiration.colorClass}`} 
                                    style={{ width: `${expiration.progress}%` }}
                                  />
                                </div>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${expiration.textClass}`}>
                                  Son Kullanma: {expiration.days} Gün
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      {/* Show More/Less Button */}
                      {items.length > 4 && (
                        <div className="mt-6 flex justify-center">
                          <button 
                            onClick={() => toggleExpand(categoryName)} 
                            className="px-6 py-2 rounded-full border-2 border-primary/20 text-primary font-bold hover:bg-primary/10 transition-colors text-sm"
                          >
                            {isExpanded ? "Daha Az Göster" : `Tüm ${items.length} Ürünü Göster`}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddIngredientModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

