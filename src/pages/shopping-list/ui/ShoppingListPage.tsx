import { useState, useMemo } from "react";
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar";
import { DashboardHeader } from "@/widgets/dashboard-header/ui/DashboardHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shoppingListApi } from "@/entities/shopping-list/api/shoppingListApi";
import { ShoppingListGroup } from "@/widgets/shopping-list/ui/ShoppingListGroup";
import { AddShoppingListItem } from "@/features/shopping-list/ui/AddShoppingListItem";
import { Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { MeasurementUnit } from "@/shared/constants/measurement";

export const ShoppingListPage = () => {
  const queryClient = useQueryClient();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"category" | "recipe">("category");
  const [sortBy, setSortBy] = useState<"name" | "recent">("recent");
  const [filterBy, setFilterBy] = useState<"all" | "unselected">("all");
  
  const { data: shoppingList, isLoading } = useQuery({
    queryKey: ["shopping-list"],
    queryFn: shoppingListApi.getMyShoppingList
  });

  const deleteMutation = useMutation({
    mutationFn: shoppingListApi.removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, qty, unit }: { id: string, qty: number, unit: MeasurementUnit }) => 
      shoppingListApi.updateItem(id, { newQuantity: qty, newUnit: unit }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    }
  });

  const bulkPurchaseMutation = useMutation({
    mutationFn: shoppingListApi.bulkMarkAsPurchased,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      setSelectedItemIds([]);
    }
  });

  const handleToggleSelect = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleDoneShopping = () => {
    if (selectedItemIds.length > 0) {
      bulkPurchaseMutation.mutate(selectedItemIds);
    }
  };

  // Processing logic (Filtering, Sorting, Grouping)
  const groupedList = useMemo(() => {
    if (!shoppingList) return {};
    
    // 1. Filter
    let processedList = shoppingList;
    if (filterBy === "unselected") {
      processedList = shoppingList.filter(item => !selectedItemIds.includes(item.id));
    }

    // 2. Sort
    processedList = [...processedList].sort((a, b) => {
      if (sortBy === "name") return a.ingredientName.localeCompare(b.ingredientName);
      // 'recent' can just keep original order assuming API returns recent first, 
      // or we sort by ID/Date if available. Assuming original is recent.
      return 0; 
    });

    // 3. Group
    return processedList.reduce((acc, item) => {
      const cat = item.categoryName || "DİĞER";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, typeof shoppingList>);
  }, [shoppingList, filterBy, sortBy, selectedItemIds]);

  const totalItems = shoppingList?.length || 0;
  const doneItems = selectedItemIds.length;
  const progressPercentage = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-500">
      <Sidebar />
      <main className="lg:ml-72 min-h-screen flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-3">Alışveriş Listesi</h1>
              <p className="text-lg text-muted-foreground font-medium">Haftalık kiler ve mutfak alışverişini planla.</p>
            </div>
            
            {/* Progress Circle */}
            <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-4 rounded-3xl shadow-sm border border-muted/30">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-muted fill-none" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    className="stroke-primary fill-none transition-all duration-500 ease-out" 
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-bold">{progressPercentage}%</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl font-black leading-none">{doneItems}/{totalItems}</span>
                <span className="text-xs font-bold text-muted-foreground tracking-widest mt-1">TAMAMLANAN</span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center bg-white dark:bg-neutral-900 p-1 rounded-2xl shadow-sm border border-muted/30">
                <button 
                  onClick={() => setActiveTab("category")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "category" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Kategoriye Göre
                </button>
                <button 
                  onClick={() => setActiveTab("recipe")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "recipe" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tarife Göre
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "name" | "recent")}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-neutral-900 border border-muted/50 rounded-xl text-sm font-bold text-foreground outline-none focus:border-primary cursor-pointer shadow-sm"
                  >
                    <option value="recent">Sırala: Varsayılan</option>
                    <option value="name">Sırala: İsim (A-Z)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                <div className="relative group">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as "all" | "unselected")}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-neutral-900 border border-muted/50 rounded-xl text-sm font-bold text-foreground outline-none focus:border-primary cursor-pointer shadow-sm"
                  >
                    <option value="all">Filtre: Tümü</option>
                    <option value="unselected">Filtre: Eksikler</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : totalItems === 0 ? (
              <div className="py-20 text-center flex flex-col items-center bg-white dark:bg-neutral-900/50 rounded-3xl p-8 border border-dashed border-muted/50">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Listeniz Bomboş!</h3>
                <p className="text-muted-foreground">Alışveriş listenize malzeme eklemeye başlayın.</p>
              </div>
            ) : Object.keys(groupedList).length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-neutral-900/50 rounded-3xl p-8 border border-dashed border-muted/50">
                <p className="text-muted-foreground font-medium">Bu filtreye uygun malzeme bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedList).map(([cat, items]) => (
                  <ShoppingListGroup 
                    key={cat} 
                    categoryName={cat} 
                    items={items} 
                    selectedItemIds={selectedItemIds}
                    onToggleSelect={handleToggleSelect}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onUpdate={(id, qty, unit) => updateMutation.mutate({ id, qty, unit })}
                  />
                ))}
              </div>
            )}

            {/* Add Input */}
            <div className="pt-4">
              <AddShoppingListItem />
            </div>

            {/* Done Shopping Button */}
            <button
              onClick={handleDoneShopping}
              disabled={selectedItemIds.length === 0 || bulkPurchaseMutation.isPending}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                selectedItemIds.length > 0 
                  ? "bg-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" 
                  : "bg-white dark:bg-neutral-900 text-muted-foreground cursor-not-allowed border-2 border-dashed border-muted/50"
              }`}
            >
              {bulkPurchaseMutation.isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Alışverişi Tamamla</span>
                </>
              )}
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};
