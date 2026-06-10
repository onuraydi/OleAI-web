import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Leaf, Apple, Beef, Fish, Milk, Wheat, Flame, Coffee, Grape, Sparkles, Loader2, ChevronDown, ChevronUp, Plus, MoreHorizontal, MoreVertical, ShoppingCart, Trash2, Edit2, Minus } from "lucide-react";
import { pantryApi } from "@/entities/pantry/api/pantryApi";
import type { PantryItemResponse } from "@/entities/pantry/api/pantryApi";
import { shoppingListApi } from "@/entities/shopping-list/api/shoppingListApi";
import { motion, AnimatePresence } from "framer-motion";
import { AddIngredientModal } from "@/features/add-pantry-item/ui/AddIngredientModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/shared/ui/alert-dialog";
import { toast } from "sonner";
import { getCategoryIcon } from "@/shared/lib/icon-helpers";
import { MEASUREMENT_UNIT_LABELS } from "@/shared/constants/measurement";

// Karta özel kısa birim gösterimleri
const UNIT_SHORT_LABELS: Record<string, string> = {
  "Piece": "Adet",
  "Kilogram": "kg",
  "Gram": "g",
  "Liter": "L",
  "Milliliter": "ml",
  "Packet": "Paket",
  "Bunch": "Demet",
  "Slice": "Dilim",
  "Pinch": "Tutam",
  "Other": "Birim"
};

import { MeasurementUnit } from "@/shared/constants/measurement";

// Deterministic mock for expiration days based on item ID (to keep it consistent across renders)
const getExpirationMock = (id: string) => {
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const days = (hash % 14) + 1; // 1 to 14 days

  let colorClass = "bg-[#4CAF50]"; // Green
  let textClass = "text-[#4CAF50]";
  let hexColor = "#4CAF50";
  let progress = Math.min((days / 14) * 100, 100);

  if (days <= 3) {
    colorClass = "bg-[#F44336]"; // Red
    textClass = "text-[#F44336]";
    hexColor = "#F44336";
    progress = 100; // Inverse visualization: red means urgent
  } else if (days <= 7) {
    colorClass = "bg-[#FF9800]"; // Yellow/Orange
    textClass = "text-[#FF9800]";
    hexColor = "#FF9800";
    progress = 50;
  }

  return { days, colorClass, textClass, progress, hexColor };
};

const mapUnitNameToEnum = (unitName: string): number => {
  // Map string to enum manually, assuming 0 is Default/Pieces if not matched
  const lower = unitName?.toLowerCase();
  if (lower === "kg" || lower === "kilogram") return MeasurementUnit.Kilogram;
  if (lower === "g" || lower === "gram") return MeasurementUnit.Gram;
  if (lower === "l" || lower === "litre") return MeasurementUnit.Liter;
  if (lower === "ml" || lower === "mililitre") return MeasurementUnit.Milliliter;
  if (lower === "adet") return MeasurementUnit.Piece;
  if (lower === "paket") return MeasurementUnit.Packet;
  if (lower === "demet") return MeasurementUnit.Bunch;
  if (lower === "dilim") return MeasurementUnit.Slice;
  return MeasurementUnit.Piece; // Default
};

const PantryItemCard = ({ 
  item, 
  categoryName, 
  idx 
}: { 
  item: PantryItemResponse; 
  categoryName: string; 
  idx: number;
}) => {
  const queryClient = useQueryClient();
  const expiration = getExpirationMock(item.id);
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isShoppingListModalOpen, setIsShoppingListModalOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(item.quantity);
  const [shoppingQuantity, setShoppingQuantity] = useState<number>(1);

  const updateMutation = useMutation({
    mutationFn: (newQuantity: number) => pantryApi.updateIngredientQuantity(item.id, newQuantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pantry"] });
      toast.success("Miktar güncellendi.");
      setIsUpdateModalOpen(false);
    },
    onError: () => {
      toast.error("Miktar güncellenemedi.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => pantryApi.deleteIngredient(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pantry"] });
      toast.success("Malzeme silindi.");
      setIsDeleteAlertOpen(false);
    },
    onError: () => {
      toast.error("Malzeme silinemedi.");
    }
  });

  const addToShoppingListMutation = useMutation({
    mutationFn: () => shoppingListApi.addItem({
      ingredientId: item.masterIngredientId || undefined,
      requestedName: !item.masterIngredientId ? item.name : undefined,
      quantity: shoppingQuantity,
      unit: mapUnitNameToEnum(item.unit)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      toast.success(`${item.name} alışveriş listesine eklendi.`);
      setIsShoppingListModalOpen(false);
    },
    onError: (error: any) => {
      if(error?.response?.status === 409) {
        toast.error("Bu malzeme zaten alışveriş listesinde mevcut.");
      } else {
        toast.error("Alışveriş listesine eklenemedi.");
      }
    }
  });

  const handleIncrease = () => setQuantity(q => q + 1);
  const handleDecrease = () => setQuantity(q => Math.max(0.1, q - 1)); // Prevent negative/zero

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: idx * 0.05, duration: 0.3 }}
        className="group relative flex items-center gap-4 bg-card rounded-[1.5rem] p-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-muted/80 dark:border-white/10 hover:border-primary/50 overflow-hidden"
      >
        {/* Icon Background */}
        <div className="relative w-14 h-14 rounded-2xl flex-shrink-0 bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 group-hover:bg-primary/15 transition-colors">
          <div className="text-primary z-10 group-hover:scale-110 transition-all duration-300">
            {getCategoryIcon(categoryName)}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 py-1 mr-4">
          <h3 className="font-bold text-sm text-foreground mb-1 truncate group-hover:text-primary transition-colors">{item.name}</h3>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md w-fit whitespace-nowrap">
              {item.quantity} {UNIT_SHORT_LABELS[item.unit] || item.unit}
            </p>
            {item.isPendingApproval && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                Bekliyor
              </span>
            )}
          </div>
        </div>

        {/* Expiration Indicator */}
        <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0 pl-3 border-l border-muted/30">
          <div 
            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
            style={{ 
              backgroundColor: `${expiration.hexColor}15`, 
              color: expiration.hexColor,
              border: `1px solid ${expiration.hexColor}30`
            }}
          >
            {expiration.days} Gün
          </div>
          <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${expiration.progress}%`, backgroundColor: expiration.hexColor }}
            />
          </div>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end gap-2 pl-12 pr-4 bg-gradient-to-l from-white via-white to-transparent dark:from-[#18181b] dark:via-[#18181b] translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={() => { setQuantity(item.quantity); setIsUpdateModalOpen(true); }}
            className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 shadow-sm"
            title="Miktarı Güncelle"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setShoppingQuantity(1); setIsShoppingListModalOpen(true); }}
            className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all hover:scale-110 shadow-sm"
            title="Alışveriş Listesine Ekle"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsDeleteAlertOpen(true)}
            className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all hover:scale-110 shadow-sm"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Update Quantity Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{item.name} Miktarını Güncelle</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 gap-6">
            <div className="flex items-center gap-6">
              <button 
                onClick={handleDecrease}
                className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Minus className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col items-center min-w-[100px]">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-28 bg-transparent text-center text-4xl font-black text-foreground outline-none border-b-2 border-transparent focus:border-primary/50 transition-colors pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm font-bold text-muted-foreground mt-1">{item.unit}</span>
              </div>
              
              <button 
                onClick={handleIncrease}
                className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setIsUpdateModalOpen(false)}
              className="flex-1 h-12 rounded-xl font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              İptal
            </button>
            <button 
              onClick={() => updateMutation.mutate(quantity)}
              disabled={updateMutation.isPending || quantity === item.quantity}
              className="flex-1 h-12 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Kaydet"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shopping List Modal */}
      <Dialog open={isShoppingListModalOpen} onOpenChange={setIsShoppingListModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{item.name} Listeye Eklenecek</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 gap-6">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setShoppingQuantity(q => Math.max(0.1, q - 1))}
                className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Minus className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col items-center min-w-[100px]">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={shoppingQuantity}
                  onChange={(e) => setShoppingQuantity(Number(e.target.value))}
                  className="w-28 bg-transparent text-center text-4xl font-black text-foreground outline-none border-b-2 border-transparent focus:border-primary/50 transition-colors pb-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm font-bold text-muted-foreground mt-1">{item.unit}</span>
              </div>
              
              <button 
                onClick={() => setShoppingQuantity(q => q + 1)}
                className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setIsShoppingListModalOpen(false)}
              className="flex-1 h-12 rounded-xl font-bold bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              İptal
            </button>
            <button 
              onClick={() => addToShoppingListMutation.mutate()}
              disabled={addToShoppingListMutation.isPending}
              className="flex-1 h-12 rounded-xl font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {addToShoppingListMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Ekle"}
            </button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Bu malzemeyi silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-bold text-foreground">{item.name}</span> dolabınızdan kalıcı olarak silinecektir. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Evet, Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const PantryFeed = () => {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pantryItems, isLoading, isError } = useQuery({
    queryKey: ["my-pantry"],
    queryFn: () => pantryApi.getMyPantry(),
  });

  const groupedItems = useMemo(() => {
    if (!pantryItems) return {};

    const filtered = pantryItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((acc, item) => {
      const cat = item.categoryName || "Diğer";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, PantryItemResponse[]>);
  }, [pantryItems, searchTerm]);

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
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">Mutfak Dolabım</h1>
          <p className="text-lg text-muted-foreground font-medium">
            Malzemelerinizi yönetin ve tazeliklerini kolayca takip edin.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-4">
          <div className="relative group w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Dolabındaki malzemelerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-card border-2 border-muted/30 focus:border-primary focus:bg-background shadow-sm outline-none transition-all font-medium text-sm"
            />
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm shrink-0"
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
                        {displayedItems.map((item, idx) => (
                          <PantryItemCard 
                            key={item.id} 
                            item={item} 
                            categoryName={categoryName} 
                            idx={idx} 
                          />
                        ))}
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
